import asyncHandler from 'express-async-handler';
import { type NextFunction, type Request, type Response } from 'express';
import Session, { type ISession, type IQuestion } from '../models/session.model.js';
import fetch from 'node-fetch';
import fs from 'fs';
import FormData from 'form-data';
import path from 'path';
import mongoose, { type ObjectId } from 'mongoose';
import type { Server } from 'socket.io';

// Define types for the session data that will be sent via socket
interface SessionSocketData {
  _id?: any;
  user?: any;
  role?: string;
  level?: string;
  interviewType?: string;
  status?: string;
  questions?:  IQuestion[];
  overallScore?: number;
  metrics?: {
    avgTechnical?: number;
    avgConfidence?: number;
  };
  createdAt?: Date;
  endTime?: Date;
  [key: string]: any; // Allow other properties
}

const AI_SERVICE_URL = "http://localhost:8000";

const pushSocketUpdate = (
    io: Server,
    userId: string,
    sessionId: string,
    status: string,
    message: string,
    sessionData: SessionSocketData | null = null
) => {
    io.to(userId).emit("sessionUpdate", {
        sessionId,
        status,
        message,
        session: sessionData, // Changed from sessionData to session to match JS version
    });
};

// @desc    Create a new interview session and start AI question generation
// @route   POST /api/sessions/
// @access  Private
const createSession = asyncHandler(async (req: Request, res: Response) => {
    const { role, level, interviewType, count } = req.body;
    const userId = req.user!._id;

    if (!role || !level || !interviewType || !count) {
        res.status(400);
        throw new Error('Please specify role, level, interview type, and question count.');
    }

    let session = await Session.create({
        user: userId,
        role,
        level,
        interviewType,
        status: "pending",
    });

    const io: Server = req.app.get("io");

    // Return 202 Accepted to match JS version
    res.status(202).json({
        message: 'Session created. Generating questions asynchronously...',
        sessionId: session._id,
        status: 'processing',
    });

    // IIFE - Immediately Invoked Function Expression
    (async () => {
        try {
            pushSocketUpdate(
                io,
                userId.toString(),
                session._id.toString(),
                "AI_GENERATING_QUESTIONS",
                `Generating ${count} questions for ${role}...`,
                null
            );

            const aiResponse = await fetch(`${AI_SERVICE_URL}/generate-questions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    role,
                    level,
                    count,
                    interview_type: interviewType // FIXED: Added interview_type to match JS version
                })
            });

            if (!aiResponse.ok) {
                const errorBody = await aiResponse.text();
                throw new Error(`AI Service error: ${aiResponse.status} - ${errorBody}`);
            }

            const aiData = await aiResponse.json() as { questions: string[] };
            const codingCount = interviewType === 'coding-mix' ? Math.floor(count * 0.2) : 0;

            // C. Map the raw questions into the structured Mongoose sub-document format
            const questionsArray = aiData.questions.map((qText: string, index: number) => ({
                questionText: qText,
                questionType: index < codingCount ? 'coding' : 'oral',
                isEvaluated: false,
                isSubmitted: false,
            }));

            // D. Update the session in MongoDB
            session.questions = questionsArray as IQuestion[];
            session.status = 'in-progress';
            await session.save();

            pushSocketUpdate(
                io,
                userId.toString(),
                session._id.toString(),
                "QUESTIONS_READY",
                'Questions generated successfully. Starting session.',
                session
            );

        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            console.error(`Session Creation Failure for ${session._id}:`, err.message);

            session.status = 'failed';
            await session.save();
            pushSocketUpdate(
                io,
                userId.toString(),
                session._id.toString(),
                'GENERATION_FAILED',
                `Question generation failed. Reason: ${err.message}.`,
                session
            );
        }
    })();
});

// @desc    Get all interview sessions for the current user
// @route   GET /api/sessions/
// @access  Private
const getSessions = asyncHandler(async (req: Request, res: Response) => {
    // Find all sessions for the logged-in user, sorted by newest first
    const sessions = await Session.find({ user: req.user!._id })
        .sort({ createdAt: -1 })
        .select('-questions.userAnswerText -questions.userSubmittedCode'); // Exclude heavy data for list view
    res.json(sessions);
});

// @desc    Get a specific session detail
// @route   GET /api/sessions/:id
// @access  Private
const getSessionById = asyncHandler(async (req: Request, res: Response) => {
    // Find session by ID and ensure it belongs to the logged-in user
    const session = await Session.findOne({ _id: req.params.id, user: req.user!._id });

    if (session) {
        res.json(session);
    } else {
        res.status(404);
        throw new Error('Session not found or user unauthorized.');
    }
});

// @desc    Delete a session
// @route   DELETE /api/sessions/:id
// @access  Private
const deleteSession = asyncHandler(async (req: Request, res: Response) => {
    const session = await Session.findById(req.params.id);

    if (!session) {
        res.status(404);
        throw new Error('Session not found');
    }

    // Check if the user owns this session
    if (session.user.toString() !== req.user!.id) {
        res.status(401);
        throw new Error('Not authorized');
    }

    await session.deleteOne();

    res.status(200).json({ id: req.params.id });
});

// @desc    Submit an answer (Audio or Code)
// @route   POST /api/sessions/:id/submit-answer
// @access  Private
const submitAnswer = asyncHandler(async (req: Request, res: Response) => {
    const sessionId = req.params.id as string;
    const { questionIndex, code } = req.body; // Remove submissionType if not strictly needed
    const userId = req.user!._id;

    const session = await Session.findById(sessionId);

    if (!session || session.user.toString() !== userId.toString()) {
        res.status(404);
        throw new Error('Session not found or user unauthorized.');
    }

    const questionIdx = parseInt(questionIndex, 10);
    const question = session.questions![questionIdx];

    if (!question) {
        res.status(400);
        throw new Error(`Question at index ${questionIdx} not found.`);
    }

    let audioFilePath = null;
    if (req.file) {
        audioFilePath = path.join(process.cwd(), req.file.path);
    }

    const codeSubmission = code || null;

    question.isSubmitted = true;
    await session.save();

    // Return 202 Accepted to match JS version
    res.status(202).json({
        message: 'Answer received. Processing asynchronously...',
        status: 'received',
    });

    const io = req.app.get('io');

    evaluateAnswerAsync(io, userId.toString(), sessionId, questionIdx, audioFilePath, codeSubmission);
});

const evaluateAnswerAsync = async (
    io: Server,
    userId: string,
    sessionId: string,
    questionIndex: number | string,
    audioFilePath: string | null = null,
    code: string | null = null
): Promise<void> => {
    const questionIdx = typeof questionIndex === 'string' ? parseInt(questionIndex, 10) : questionIndex;

    const session = await Session.findById(sessionId);
    if (!session) {
        console.error(`Session ${sessionId} not found`);
        return;
    }

    const question = session.questions![questionIdx];
    if (!question) {
        pushSocketUpdate(io, userId, sessionId, 'EVALUATION_FAILED', `Q${questionIdx + 1} not found.`, null);
        return;
    }

    let transcription = '';
    if (audioFilePath) {
        try {
            pushSocketUpdate(io, userId, sessionId, 'AI_TRANSCRIBING', `Transcribing audio for Q${questionIdx + 1}...`, null);

            const formData = new FormData();
            formData.append('file', fs.createReadStream(audioFilePath));

            const transResponse = await fetch(`${AI_SERVICE_URL}/transcribe`, {
                method: 'POST',
                body: formData,
                headers: formData.getHeaders(),
            });

            if (!transResponse.ok) {
                throw new Error('Transcription service failed');
            }

            const transData = (await transResponse.json()) as { transcription?: string };
            transcription = transData.transcription || '';

        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            console.error(`Transcription Error: ${err.message}`);
        } finally {
            if (audioFilePath && fs.existsSync(audioFilePath)) {
                fs.unlinkSync(audioFilePath);
            }
        }
    }

    try {
        pushSocketUpdate(io, userId, sessionId, 'AI_EVALUATING', `AI is analyzing Q${questionIdx + 1}...`, null);

        const evalResponse = await fetch(`${AI_SERVICE_URL}/evaluate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question: question.questionText,
                question_type: question.questionType,
                role: session.role,
                level: session.level,
                user_answer: transcription,
                user_code: code || '',
            }),
        });

        if (!evalResponse.ok) {
            throw new Error('AI Evaluation service failed');
        }

        const evalData = (await evalResponse.json()) as {
            technicalScore: number;
            confidenceScore: number;
            aiFeedback: string;
            idealAnswer: string;
        };

        question.userAnswerText = transcription;
        question.userSubmittedCode = code || '';
        question.technicalScore = evalData.technicalScore;
        question.confidenceScore = evalData.confidenceScore;
        question.aiFeedback = evalData.aiFeedback;
        question.idealAnswer = evalData.idealAnswer;
        question.isEvaluated = true;

        // Check if all questions in the entire session are now evaluated
        const allQuestionsEvaluated = session.questions!.every((q) => q.isEvaluated);

        // RECALCULATION LOGIC:

        if (session.status === 'completed' || allQuestionsEvaluated) {
            const scoreSummary = await calculateOverallScore(sessionId);

            session.overallScore = scoreSummary.overallScore || 0;
            session.metrics = {
                avgTechnical: scoreSummary.avgTechnical,
                avgConfidence: scoreSummary.avgConfidence,
            };

            if (allQuestionsEvaluated) {
                session.status = 'completed';
                session.endTime = session.endTime || new Date();
            }

            await session.save();

            pushSocketUpdate(io, userId, sessionId, 'SESSION_COMPLETED', 'Scores finalized.', session);
        } else {
            await session.save();
            pushSocketUpdate(io, userId, sessionId, 'EVALUATION_COMPLETE', `Feedback for Q${questionIdx + 1} is ready!`, session);
        }
    } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error(`Evaluation Error: ${err.message}`);
        pushSocketUpdate(io, userId, sessionId, 'EVALUATION_FAILED', 'Evaluation failed.', session);
    }
};

const calculateOverallScore = async (sessionId: string) => {
    const results = await Session.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(sessionId) } },
        { $unwind: '$questions' },
        {
            $group: {
                _id: '$_id',
                avgTechnical: {
                    $avg: { $cond: [{ $eq: ['$questions.isEvaluated', true] }, '$questions.technicalScore', 0] }
                },
                avgConfidence: {
                    $avg: { $cond: [{ $eq: ['$questions.isEvaluated', true] }, '$questions.confidenceScore', 0] }
                }
            }
        },
        {
            $project: {
                _id: 0,
                overallScore: { $round: [{ $avg: ['$avgTechnical', '$avgConfidence'] }, 0] },
                avgTechnical: { $round: ['$avgTechnical', 0] },
                avgConfidence: { $round: ['$avgConfidence', 0] },
            }
        }
    ]);

    return results[0] || { overallScore: 0, avgTechnical: 0, avgConfidence: 0 };
};

// @desc    End the session early
// @route   POST /api/sessions/:id/end
// @access  Private
const endSession = asyncHandler(async (req: Request, res: Response) => {
    const sessionId = req.params.id as string;
    const userId = req.user!._id;

    const session = await Session.findById(sessionId);

    if (!session || session.user.toString() !== userId.toString()) {
        res.status(404);
        throw new Error('Session not found or user unauthorized.');
    }
    const isProcessing = session.questions!.some(q => q.isSubmitted && !q.isEvaluated);
    if (isProcessing) {
        res.status(400);
        throw new Error('Cannot end interview while AI is processing answers.');
    }

    if (session.status === 'completed') {
        res.status(400);
        throw new Error('Session is already completed.');
    }

    const scoreSummary = await calculateOverallScore(sessionId);

    session.overallScore = scoreSummary.overallScore || 0;
    session.status = 'completed';
    session.endTime = new Date();
    session.metrics = {
        avgTechnical: scoreSummary.avgTechnical,
        avgConfidence: scoreSummary.avgConfidence,
    };

    await session.save();

    const io = req.app.get('io') as Server;
    pushSocketUpdate(io, userId.toString(), sessionId, 'SESSION_COMPLETED', 'Interview session ended early.', session);

    res.json({ message: 'Session ended successfully.', session });
});

export {
    createSession,
    getSessionById,
    getSessions,
    submitAnswer,
    endSession,
    calculateOverallScore,
    deleteSession
};
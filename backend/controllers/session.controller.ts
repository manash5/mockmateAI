import asyncHandler from 'express-async-handler'; 
import { type NextFunction, type Request, type Response } from 'express'; 
import Session from '../models/session.model.js';
import fetch from 'node-fetch'; 
import fs from 'fs'; 
import FormData from 'form-data';
import path from 'path';
import mongoose from 'mongoose';
import type { Server } from 'socket.io';

type SessionStatus = 'pending' | 'in-progress' | 'completed' | 'failed';

interface SessionUpdateData {
  overallScore?: number;
  metrics?: {
    avgTechnical?: number;
    avgConfidence?: number;
  };
}

const AI_SERVICE_URL = "http://localhost:8000"; 

const pushSocketUpdate = (
    io:Server, 
    userId:string , 
    sessionId: string, 
    status: string, 
    message: string, 
    sessionData: SessionUpdateData | null = null
)=> {
    io.to(userId).emit("sessionUpdate", {
        sessionId, 
        status, 
        message, 
        sessionData, 
    })
}

const createSession = asyncHandler(async(req: Request, res: Response)=> {
  const {role, level, interviewType, count} = req.body; 
  const userId = req.user!._id; 
  if(!role|| !level || !interviewType ||  !count){
    res.status(400); 
    throw new Error("please fill all the fields "); 
  }
  let session = await Session.create({
    user: userId, 
    role, 
    level, 
    interviewType, 
    status: "pending", 
  })

  const io: Server = req.app.get("io") ; 

  res.status(201).json({
    message: "Session created sucessfully", 
    sessionId: session._id, 
    status: "processing"
  }); 

  // IIFE - Immediately Invoked Funciton Expression 
  (async()=>{
    try {
      pushSocketUpdate(io, userId.toString(), session._id.toString(), "ai generating questions...", 
      `AI generating ${count} questions for ${level} level ${role} role interview...`); 

      const aiResponse = await fetch(`${AI_SERVICE_URL}/generate-questions`, {
        method: "POST", 
        headers: {
          "Content-Type": "application/json"
        }, 
        body: JSON.stringify({
          role, 
          level, 
          count
        })
      }); 

      if(!aiResponse.ok){
        const errorBody = await aiResponse.text(); 
        throw new Error(`ai service error:${aiResponse.status}- ${errorBody}`)
      }

      const aiData = await aiResponse.json(); 
      const codingCount = interviewType==='coding-mix'? Math.floor(count*0.2): 0; 

      const questions = aiData.questions.map((qText: string, index:number)=> ({
        questionText: qText, 
        questionType: index<codingCount?"coding":"oral", 
        isEvaluated: false, 
        isSubmited: false, 
      })); 

      session.questions= questions;  
      session.status = 'in-progress';  
      await session.save(); 

      pushSocketUpdate(io, userId.toString(), session._id.toString(), "questions ready", 
      `starting interview...`); 

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(`...`, err.message);

      // F. Handle failure: Update status and notify client
      session.status = 'failed';
      await session.save();
      pushSocketUpdate(io, userId.toString(), session._id.toString(), 'GENERATION_FAILED', `Question generation failed. Reason: ${err.message}.`);
    }
  })(); 
  
})

const getSessions = asyncHandler(async(req: Request, res: Response)=> {
  const userId = req.params.id; 
  const session = await Session.find({user: userId}); 
  res.status(200).json(session); 
})

const getSessionById = asyncHandler(async(req: Request, res: Response)=> {
  const session = await Session.findOne({_id: req.params.id, user: req.user!._id}); 

  if(session){
    res.status(200).json(session); 
  }else {
    res.status(404); 
    throw new Error('Session not found or user unauthorized ')
  }
})

const deleteSession = asyncHandler(async(req: Request, res: Response)=> {
  const session = await Session.findById(req.params.id);

   if (!session) {
        res.status(404);
        throw new Error('Session not found');
    }

    // Check if the user owns this session
    if (session.user.toString() !== req.user!._id.toString()) {
        res.status(401);
        throw new Error('Not authorized');
    }

    await session.deleteOne();

    res.status(200).json({ id: req.params.id });
}); 

const evaluateAnswerAsync = async (
  io: Server,
  userId: string,
  sessionId: string,
  questionIndex: number | string,
  audioFilePath: string | null = null,
  code: string | null = null
): Promise<void> => {
  // Normalize question index to number
  const questionIdx = typeof questionIndex === 'string' ? parseInt(questionIndex, 10) : questionIndex;

  // Fetch the session from DB
  const session = await Session.findById(sessionId);
  if (!session) {
    console.error(`Session ${sessionId} not found`);
    return;
  }

  if (!session.questions || session.questions.length === 0) {
        throw new Error('No questions found in this session.');
    }

  // Validate that the question exists
  const question = session.questions[questionIdx];
  if (!question) {
    pushSocketUpdate(io, userId, sessionId, 'EVALUATION_FAILED', `Q${questionIdx + 1} not found.`, null);
    return;
  }

  // --- Phase 1: Transcription (only if audio file provided) ---
  let transcription = '';
  if (audioFilePath) {
    try {
      pushSocketUpdate(io, userId, sessionId, 'AI_TRANSCRIBING', `Transcribing audio for Q${questionIdx + 1}...`);

      const formData = new FormData();
      formData.append('file', fs.createReadStream(audioFilePath));

      const transResponse = await fetch(`${AI_SERVICE_URL}/transcribe`, {
        method: 'POST',
        body: formData,
        headers: formData.getHeaders(), // form-data provides this method
      });

      if (!transResponse.ok) {
        throw new Error('Transcription service failed');
      }

      const transData = (await transResponse.json()) as { transcription?: string };
      transcription = transData.transcription || '';
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(`Transcription Error: ${err.message}`);
      // Continue even if transcription fails; code may still be evaluated.
    } finally {
      // Clean up the temporary audio file if it exists
      if (audioFilePath && fs.existsSync(audioFilePath)) {
        fs.unlinkSync(audioFilePath);
      }
    }
  }

  // --- Phase 2: AI Evaluation ---
  try {
    pushSocketUpdate(io, userId, sessionId, 'AI_EVALUATING', `AI is analyzing Q${questionIdx + 1}...`);

    const evalResponse = await fetch(`${AI_SERVICE_URL}/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: question.questionText,
        question_type: question.questionType,   // "coding" or "oral"
        role: session.role,
        level: session.level,
        user_answer: transcription,              // transcribed text (may be empty)
        user_code: code || '',                    // submitted code (may be empty)
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

    // --- Phase 3: Update the question document ---
    question.userAnswerText = transcription;
    question.userSubmittedCode = code || '';
    question.technicalScore = evalData.technicalScore;
    question.confidenceScore = evalData.confidenceScore;
    question.aiFeedback = evalData.aiFeedback;
    question.idealAnswer = evalData.idealAnswer;
    question.isEvaluated = true;

    // Check if all questions in the session are now evaluated
    const allQuestionsEvaluated = session.questions.every((q) => q.isEvaluated);

    // Recalculate overall scores if session is completed or all questions done
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

      // Save session with global score updates
      await session.save();

      pushSocketUpdate(io, userId, sessionId, 'SESSION_COMPLETED', 'Scores finalized.', session);
    } else {
      // Normal update: only this question evaluated, interview still in progress
      await session.save();
      pushSocketUpdate(io, userId, sessionId, 'EVALUATION_COMPLETE', `Feedback for Q${questionIdx + 1} is ready!`, session);
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(`Evaluation Error: ${err.message}`);
    pushSocketUpdate(io, userId, sessionId, 'EVALUATION_FAILED', `Evaluation failed.`, session);
  }
};

const submitAnswer = asyncHandler(async (req: Request, res: Response) => {
    const sessionId = req.params.id;
    const { questionIndex, code } = req.body; // Remove submissionType if not strictly needed
    const userId = req.user!._id;

    const session = await Session.findById(sessionId);

    if (!session || session.user.toString() !== userId.toString()) {
        res.status(404);
        throw new Error('Session not found or user unauthorized.');
    }

    if (!session.questions || session.questions.length === 0) {
        res.status(400);
        throw new Error('No questions found in this session.');
    }

    const questionIdx = parseInt(questionIndex, 10);
    const question = session.questions[questionIdx];

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

    res.status(202).json({
        message: 'Answer received. Processing asynchronously...',
        status: 'received',
    });

    const io = req.app.get('io');

    evaluateAnswerAsync(io, userId.toString(), sessionId!.toString() , questionIdx, audioFilePath, codeSubmission);
});

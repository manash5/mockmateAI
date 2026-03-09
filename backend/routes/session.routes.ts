import express, { Router } from 'express'
import { protect } from '../middleware/auth.middleware.js';
import { createSession, deleteSession, endSession, getSessionById, getSessions, submitAnswer } from '../controllers/session.controller.js';
import uploadSingleAudio from '../middleware/upload.middleware.js';


const sessionRoutes = Router(); 

sessionRoutes.use(protect);

sessionRoutes.route("/")
    .get(getSessions)      // Fetch all sessions
    .post(createSession);  // Create new session

sessionRoutes.route("/:id")
    .get(getSessionById)   // View session details
    .delete(deleteSession); // Delete session

sessionRoutes.route("/:id/submit-answer").post(uploadSingleAudio, submitAnswer);
sessionRoutes.route("/:id/end").post(endSession);

export default sessionRoutes;
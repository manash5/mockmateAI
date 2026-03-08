import express, { Router } from 'express'; 
import { getUserProfile, googleLogin, LoginUser, registerUser, updateUserProfile } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const userRoutes = Router(); 

userRoutes.post('/login', LoginUser); 

userRoutes.post('/register', registerUser); 

userRoutes.post('/google', googleLogin); 

userRoutes.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

export default userRoutes; 
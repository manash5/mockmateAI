import { type NextFunction, type Request, type Response } from 'express'; 
import asyncHandler from 'express-async-handler'; 
import User from '../models/user.model.js';
import {OAuth2Client} from "google-auth-library"; 
import { generateToken } from '../security/jwt-util.js';

interface AuthBody {
  name: string, 
  email: string;
  password?: string ;
}

interface GoogleAuthBody {
  token: string;
}

const client = new OAuth2Client(process.env.GOOLGE_CLIENT_ID); 

const registerUser = asyncHandler(async(req: Request<{}, {}, AuthBody>, res: Response)=> {
    const {name, email, password} = req.body; 
    if(!name || !email || !password){
        res.status(400); 
        throw new Error("Please add all fields ")
    }

    const userExists = await User.findOne({email}); 
    if (userExists){
        res.status(400); 
        throw new Error("User already exists")
    }
    const user = await User.create({
        name, 
        email, 
        password
    }); 
    if (user){
        res.status(201).json({
            id: user._id, 
            name: user.name, 
            email: user.email, 
            token: generateToken(user._id.toString()) , 
        })
    }
})


const LoginUser =asyncHandler(async(req: Request , res: Response, next: NextFunction)=> {
    const {email, password} = req.body; 
    if (!email || !password){
        res.status(400); 
        throw new Error("Please enter all the required field"); 
    }

    const user = await User.findOne({email}); 
    if(user && (await user.matchPassword(password))){
        res.json({
            _id : user._id, 
            name: user.name, 
            email: user.email, 
            preferredRole: user.preferredRole, 
            token: generateToken(user._id.toString()) ,  
        })
    } else {
        res.status(400); 
        throw new Error("Invalid credentials ")
    }
}); 

const googleLogin = asyncHandler(async (req: Request<{}, {}, GoogleAuthBody>, res: Response) => {
  
    const { token } = req.body; 

    if (!process.env.GOOGLE_CLIENT_ID) {
        res.status(500);
        throw new Error('Google Client ID not configured.');
    }
   
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    if (!ticket) {
        res.status(401);
        throw new Error('Failed to verify Google token.');
    }

    const payload = ticket.getPayload();
    if (!payload) {
        res.status(401);
        throw new Error('Invalid Google token payload.');
    }
    const { email_verified, name, email, sub: googleId } = payload;

    if (!email || !name) {
        res.status(401);
        throw new Error('Google account missing required information (email or name).');
    }

    if (!email_verified) {
        res.status(401);
        throw new Error('Google email not verified. Login failed.');
    }
    
    
    let user = await User.findOne({ email });

    if (user) {
        
        if (!user.googleId) {
            user.googleId = googleId;
            await user.save();
        }
    } else {
        
        user = await User.create({ name, email, googleId });
    }

    
    if (user) {
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            preferredRole: user.preferredRole,
            token: generateToken(user._id.toString()),
        });
    } else {
        res.status(400);
        throw new Error('Could not process user creation or login via Google.');
    }
});


const getUserProfile = asyncHandler(async(req: Request, res: Response)=> {
    if (req.user){
        res.json({
            _id: req.user._id, 
            name: req.user.name, 
            email: req.user.email, 
            preferredRole: req.user.preferredRole, 
            token: generateToken(req.user._id.toString())
        })
    } else {
        res.status(404); 
        throw new Error('User not Found ')
    }
})

const updateUserProfile = asyncHandler(async(req: Request, res: Response)=>{
    if(!req.user){
        res.status(404); 
        throw new Error("User not found");
    }
    
    const user = await User.findById(req.user._id); 
    
    if(!user){
        res.status(404); 
        throw new Error("User not found in database");
    }
    
    const body = req.body || {};
    
    if(body.name) user.name = body.name;
    if(body.email) user.email = body.email;
    if(body.preferredRole) user.preferredRole = body.preferredRole;
    if(body.password) user.password = body.password;
    
    const updatedUser = await user.save();
    
    res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        preferredRole: updatedUser.preferredRole,
        token: generateToken(updatedUser._id.toString()),
    });
})

export {registerUser, LoginUser, googleLogin, getUserProfile, updateUserProfile}; 
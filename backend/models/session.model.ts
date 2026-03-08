import mongoose, { Schema } from "mongoose";
import type { IUser } from "./user.model.js";

export interface IQuestion extends Document {
  questionText: string;
  questionType: 'coding' | 'oral';
  idealAnswer: string;
  userAnswerText: string;
  userSubmittedCode: string;
  isSubmitted: boolean;
  isEvaluated: boolean;
  technicalScore: number;
  confidenceScore: number;
  aiFeedback: string;
}

export interface ISession extends Document {
  user: IUser; 
  role: string;
  level: string;
  interviewType: 'oral-only' | 'coding-mix';
  status?: 'pending' | 'in-progress' | 'completed' | 'failed';
  overallScore?: number;
  metrics?: {
    avgTechnical: number;
    avgConfidence: number;
  };
  questions?: IQuestion[];                  
  startTime: Date;
  endTime?: Date;                          
  createdAt: Date;                          // from timestamps
  updatedAt: Date;                          // from timestamps
}

const questionSchema = new Schema<IQuestion>({
    questionText:{
        type:String,
        required:true
    },
    questionType:{
        type:String,
        enum:["coding","oral"],
        required:true
    },
    idealAnswer:{
        type:String,
        default:"pending"
    },
    userAnswerText:{
        type:String,
        default:""
    },
    userSubmittedCode:{
        type:String,
        default:""
    },
    isSubmitted:{
        type:Boolean,
        default:false
    },
    isEvaluated:{
        type:Boolean,
        default:false
    },
    technicalScore:{
        type:Number,
        default:0
    },
    confidenceScore:{
        type:Number,
        default:0
    },
    aiFeedback:{
        type:String,
        default:"Not yet submitted or evaluated"
    }
});

const sessionSchema = new Schema<ISession>(
  {
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    role:{
        type:String,
        required:true
    },
    level:{
        type:String,
        required:true
    },
    interviewType:{
        type:String,
        enum:["oral-only","coding-mix"],
        required:true
    },
    status:{
        type:String,
        enum:["pending","in-progress","completed","failed"],
        default:"pending"
    },
    overallScore: {
        type: Number,
        default: 0,
    },
    metrics: {
        avgTechnical: { type: Number, default: 0 },
        avgConfidence: { type: Number, default: 0 },
    },
    questions:[questionSchema],
    startTime:{type:Date,default:Date.now},
    endTime:{type:Date},
   
},{
    timestamps:true
});

const Session = mongoose.model<ISession>('Session', sessionSchema);
export default Session;
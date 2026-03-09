import uvicorn 
import os 
import io
import json 
import tempfile
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware  
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import Optional
from google import generativeai 
import whisper 
from pydub import AudioSegment

load_dotenv()

AI_SERVICE_PORT = os.getenv("AI_SERVICE_PORT" , 8000) 
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "gemini")

app = FastAPI("AI Interview", version="1.0")
origins = ["http://localhost:5000"]

app.middleware(
    CORSMiddleware, 
    allow_origins = origins, 
    allow_credentials = True, 
    allow_methods = ['*'], 
    allow_headers = ['*'], 
)

WHISPER_MODEL = None 

try: 
    print("Loading Whisper Model ....")
    WHISPER_MODEL = whisper.load_model("base.en") 
    print("Whisper model loaded sucessfully")
except Exception as e: 
    print("Error while loading whisper model ")
    print(e) 

class QuestionRequest(BaseModel): 
    role: str = 'MERN Stack Developer'
    level:str = "Junior "
    count: int = 5
    interview_type: str = "coding mix"

class QuestionResponse(BaseModel): 
    questions: list[str]
    model_used: str 

class EvaluationRequest(BaseModel):
    question:str
    question_type:str
    role:str
    level:str
    user_answer:Optional[str]=None
    user_code:Optional[str]=None

class EvaluationResponse(BaseModel):
    technicalScore:int
    confidenceScore:int
    aiFeedback:str
    idealAnswer:str
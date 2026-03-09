from google import genai
from google.genai import types
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
import whisper 
from pydub import AudioSegment

load_dotenv()

AI_SERVICE_PORT = int(os.getenv("AI_SERVICE_PORT" , 8000))
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "gemini")
GEMINI_MODEL_NAME = os.getenv('GEMINI_MODEL_NAME')

app = FastAPI(title="AI Interview", version="1.0")
origins = ["http://localhost:5000"]

app.add_middleware(
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


@app.get("/")
async def root(): 
    return {"message":"Hello from AI Interviewer Microservice !","model":GEMINI_MODEL_NAME}


@app.post('/generate-questions', response_model =  QuestionResponse)
async def generateQuestions(request: QuestionRequest): 
    
    try: 
        if request.interview_type == "coding-mix": 
            coding_count = int(request.count * 0.2)
            oral_oral = int(request.count) - int(coding_count)

            intruction=(
                f"The first {coding_count} questions MUST be coding challenge requiring function implementation."
                f"The remaining {oral_oral} questions MUST be conceptual oral questions."
            )
        else: 
            intruction="All questions MUST be conceptual oral questions. Do Not generate any coding or implementation challenges."
        
        system_prompt=(
            "You are a professional technical interviewer. "
            "Task: Generate interview questions. No conversational text or numbering. "
            f"Crucial : {intruction}"
            "Output exactly one question per line. "
        )

        user_prompt=(
            f"Generate exactly {request.count} unique interview questions for a {request.level}  level {request.role} "
        )

        client = genai.Client()

        response = client.models.generate_content(
            model=GEMINI_MODEL_NAME, 
            contents=user_prompt, 
            config=types.GenerateContentConfig(
                system_instruction=system_prompt, 
                temperature=0.6, 
                max_output_tokens=2048
            )
        )
        raw_text = response.text.strip()

        # Split by lines and filter empty lines
        questions = [q.strip() for q in raw_text.split('\n') if q.strip()]

        # Ensure we return exactly the requested number of questions (take first 'count')
        questions = questions[:request.count]

        return QuestionResponse(questions=questions, model_used=GEMINI_MODEL_NAME)
    except Exception as e:
        print(f"Question generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))




if __name__ == "__main__": 
    uvicorn.run(app, host = "0.0.0.0", port=AI_SERVICE_PORT)
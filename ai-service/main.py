from google import genai
from google.genai import types
import re
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

# Helper function for JSON parsing 
def parse_json_response(text: str):
    """
    Attempt to parse JSON from Gemini response.
    Falls back to cleaning the text or extracting from markdown code block.
    """
    text = text.strip()
    # Try direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Try to extract JSON from markdown code block (```json ... ```)
    json_match = re.search(r'```(?:json)?\s*\n(.*?)\n```', text, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group(1))
        except json.JSONDecodeError:
            pass

    # Try to find first { and last } and parse that substring
    start = text.find('{')
    end = text.rfind('}')
    if start != -1 and end != -1 and end > start:
        try:
            return json.loads(text[start:end+1])
        except json.JSONDecodeError:
            pass

    # Last resort: remove newlines and tabs and try again
    cleaned = re.sub(r'[\r\n\t]', ' ', text)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        raise ValueError("Could not parse JSON from response")
    

@app.get("/")
async def root(): 
    return {"message":"Hello from MockMate AI Microservice !","model":GEMINI_MODEL_NAME}


@app.post('/generate-questions', response_model =  QuestionResponse)
async def generateQuestions(request: QuestionRequest): 
    
    try: 
        if request.interview_type in ("coding-mix", "coding mix"):
            coding_count = int(request.count * 0.2)
            oral_oral = int(request.count) - int(coding_count)

            intruction=(
                f"The first {coding_count} questions MUST be coding challenge requiring function implementation."
                f"The remaining {oral_oral} questions MUST be conceptual oral questions."
            )
        else: 
            intruction="All questions MUST be conceptual oral questions. Do Not generate any coding or implementation challenges."
        
        system_prompt = (
            "You are a senior technical interviewer at a top-tier tech company (FAANG level). "
            "Your job is to generate REAL, HIGH-SIGNAL interview questions that are currently being asked in the industry. "
            "Use your knowledge of recent hiring trends, LinkedIn posts from candidates who got hired, "
            "tech interview blogs (LeetCode discussions, Blind, Glassdoor, levels.fyi), and GitHub interview prep repos. "
            "RULES: "
            "1. Questions must reflect what is ACTUALLY being asked in real interviews in 2024-2025 for this exact role and level. "
            "2. For coding questions: specify the exact problem type (e.g., 'sliding window', 'dynamic programming', 'system design'). "
            "3. For conceptual questions: ask scenario-based questions ('How would you...', 'What happens when...', 'Debug this scenario...') NOT trivia. "
            "4. Vary difficulty appropriately for the level — Junior should get fundamentals + one hard stretch, Senior should get architecture + tradeoffs. "
            "5. Output EXACTLY one question per line. No numbering, no bullet points, no extra text. "
            f"CRUCIAL FORMAT RULES: {intruction}"
        )

        user_prompt = (
            f"Generate exactly {request.count} interview questions for a {request.level}-level {request.role} position. "
            f"These should reflect questions being asked at top companies right now in 2024-2025. "
            f"Prioritize questions that candidates report seeing on platforms like Blind, Glassdoor, and LeetCode discuss. "
            f"Make coding questions specific with clear problem statements. Make oral questions scenario-driven and thought-provoking."
        )

        client = genai.Client()

        response = client.models.generate_content(
            model=GEMINI_MODEL_NAME, 
            contents=user_prompt, 
            config=types.GenerateContentConfig(
                system_instruction=system_prompt, 
                temperature=0.6, 
                max_output_tokens=2048,
                tools=[types.Tool(google_search=types.GoogleSearch())]
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


@app.post("/transcribe")
async def transcribe_audio(file: UploadFile=File(...)): 
    try: 
        audio_bytes = await file.read()
        audio_in_memory = io.BytesIO(audio_bytes)
        audio_segment=AudioSegment.from_file(audio_in_memory)
        with tempfile.NamedTemporaryFile(delete = False, suffix=".mp3") as tmp: 
            temp_audio_path = tmp.name 
            audio_segment.export(temp_audio_path, format = "mp3")
        if not WHISPER_MODEL: 
            raise HTTPException(status_code=503,detail="Whisper Model is not loaded")
        
        result = WHISPER_MODEL.transcribe(temp_audio_path)

        os.remove(temp_audio_path)
        return {"transcription": result["text"].strip()}
    except Exception as e: 
        if 'temp_audio_path' in locals() and os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)
        raise HTTPException(status_code=500,detail=str(e))



@app.post("/evaluate", response_model=EvaluationResponse)
async def evaluate(request: EvaluationRequest):
    """
    Evaluate a user's answer (verbal and/or code) for a given question.
    Returns scores, feedback, and an ideal answer.
    """
    try:
        # Determine evaluation focus based on question type
        if request.question_type == "oral":
            assessment_instruction = (
                "This is a conceptual oral question. Focus purely on candidate's verbal explanation. "
                "Ignore any code blocks. "
                "CRITICAL: If the transcript is empty, nonsense (e.g. 'blah blah','testing') or irrelevant to the question, SCORE 0."
            )
        else:
            assessment_instruction = (
                "This is a coding challenge question. Evaluate the code logic and efficiency. "
                "Use the transcription only for insight into their thought process. "
                "CRITICAL: If the code is undefined, empty, just random comments, or random characters, SCORE 0."
            )

        system_instruction = (
            "You are a principal engineer conducting a technical interview at a top-tier company. "
            "You have seen thousands of interviews. You are strict, fair, and deeply technical. "
            "Your evaluation must be HONEST — do not inflate scores for weak answers. "
            ""
            "SCORING RUBRIC: "
            "technicalScore (0-100): "
            "  - 90-100: Answer is complete, correct, mentions edge cases, time/space complexity, and shows deep understanding. "
            "  - 70-89: Mostly correct, minor gaps, acceptable for the role level. "
            "  - 50-69: Partially correct but missing key concepts or has logical errors. "
            "  - 20-49: Shows basic awareness but answer is incomplete or has significant mistakes. "
            "  - 0-19: Wrong, empty, gibberish, or completely off-topic. "
            ""
            "confidenceScore (0-100): Based on how well-structured, clear, and decisive the verbal explanation was. "
            "  - High score: Clear structure, uses correct terminology, addresses follow-ups proactively. "
            "  - Low score: Vague, uncertain language, unable to explain their own logic, rambling. "
            "  - ZERO if verbal answer is empty, random noise, or irrelevant to the question. "
            ""
            "aiFeedback: 3-4 sentences. Structure as: (1) What they got right. (2) What was missing or wrong. (3) One specific improvement tip for this exact role/level. "
            ""
            "idealAnswer: A comprehensive Markdown answer that a HIRED candidate would give. Include: "
            "  - For oral: clear explanation, real-world analogy if helpful, edge cases, and WHY it works. "
            "  - For coding: working code with comments, time/space complexity analysis, and mention of alternative approaches. "
            "  - Reference patterns that top candidates use (seen on LeetCode, interview blogs, hired engineer posts). "
            ""
            f"Context: {assessment_instruction} "
            ""
            "CRITICAL RULES: "
            "RULE 1: If answer is gibberish, empty, or irrelevant → technicalScore: 0, confidenceScore: 0. "
            "RULE 2: idealAnswer MUST be a plain Markdown string, NOT a nested JSON object. "
            "RULE 3: Respond ONLY with a valid JSON object. No preamble, no markdown code fences, no extra text. "
            "Required keys: 'technicalScore' (int), 'confidenceScore' (int), 'aiFeedback' (string), 'idealAnswer' (string)."
        )

        user_prompt = (
            f"Role: {request.role}\n"
            f"Seniority Level: {request.level}\n"
            f"Question Type: {request.question_type}\n"
            f"Interview Question: {request.question}\n\n"
            f"Candidate's Verbal Answer (transcribed): {request.user_answer or 'No verbal answer provided.'}\n\n"
            f"Candidate's Code Submission:\n```\n{request.user_code or 'No code provided.'}\n```\n\n"
            f"Evaluate this candidate as if you are deciding whether to hire them at a top tech company for this exact role and level. "
            f"The ideal answer should reflect what successful candidates who got this role actually answered — "
            f"based on real interview reports from Glassdoor, Blind, and LinkedIn posts from hired engineers."
        )

        # Configure Gemini model with lower temperature for consistency
        client = genai.Client(); 
        response = client.models.generate_content(
            model=GEMINI_MODEL_NAME, 
            contents=user_prompt, 
            config=types.GenerateContentConfig(
                system_instruction=system_instruction, 
                temperature=0.1, 
                max_output_tokens=1024
            )
        )
        response_text = response.text.strip()

        # Parse JSON from response
        try:
            evaluation_data = parse_json_response(response_text)
        except ValueError as e:
            print(f"Failed to parse JSON: {e}")
            print(f"Raw response: {response_text}")
            # Return a default failed evaluation
            return EvaluationResponse(
                technicalScore=0,
                confidenceScore=0,
                aiFeedback="Failed to parse evaluation response. Please try again.",
                idealAnswer="Unable to generate ideal answer."
            )

        # Ensure idealAnswer is a string (in case Gemini returns an object)
        if 'idealAnswer' in evaluation_data and not isinstance(evaluation_data['idealAnswer'], str):
            evaluation_data['idealAnswer'] = json.dumps(evaluation_data['idealAnswer'])

        # Validate that required keys are present and have correct types (basic)
        required_keys = ['technicalScore', 'confidenceScore', 'aiFeedback', 'idealAnswer']
        if not all(key in evaluation_data for key in required_keys):
            missing = [key for key in required_keys if key not in evaluation_data]
            raise ValueError(f"Missing keys in evaluation response: {missing}")

        return EvaluationResponse(**evaluation_data)

    except Exception as e:
        print(f"Evaluation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__": 
    uvicorn.run(app, host = "0.0.0.0", port=AI_SERVICE_PORT)
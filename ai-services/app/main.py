# digi-thesis-ai/ai-services/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI(
    title="DigiThesis AI Services API",
    description="API for AI-powered thesis functionalities like plagiarism and grammar checks.",
    version="1.0.0",
)

# Configure CORS - essential for your Node.js server and React client to communicate with this service
# Make sure to include the exact origins of your client and main server
origins = [
    "http://localhost:3000",  # Your React client's default port
    "http://localhost:5000",  # Your Node.js main server's default port
    # In production, replace these with your actual deployed domain(s)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"], # Allows all headers
)

# Basic root endpoint to confirm the service is running
@app.get("/")
async def read_root():
    return {"message": "DigiThesis AI Services (Python/FastAPI) are running!"}

# Example: Endpoint to check if your OpenAI API key is loaded
@app.get("/check-api-key")
async def check_api_key():
    openai_key = os.getenv("OPENAI_API_KEY")
    if openai_key:
        return {"message": "OpenAI API key loaded successfully."}
    else:
        return {"message": "OpenAI API key NOT loaded. Please check your .env file."}


# TODO: You will uncomment/add your AI endpoint routers here as you build them
# Example for when you create app/api/endpoints/plagiarism.py:
# from app.api.endpoints import plagiarism
# app.include_router(plagiarism.router, prefix="/api/ai/plagiarism", tags=["Plagiarism Check"])

# Example for when you create app/api/endpoints/grammar.py:
# from app.api.endpoints import grammar
# app.include_router(grammar.router, prefix="/api/ai/grammar", tags=["Grammar Check"])
# digi-thesis-ai/ai-services/app/api/endpoints/plagiarism.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from openai import OpenAI # Assuming you installed the openai library

# Initialize OpenAI client using the API key from .env
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

router = APIRouter()

# Define the expected request body structure
class PlagiarismCheckRequest(BaseModel):
    text: str # The text content to be checked

# Define the expected response body structure
class PlagiarismCheckResponse(BaseModel):
    originality_score: float # A score from 0-100
    feedback: str            # Textual feedback

@router.post("/", response_model=PlagiarismCheckResponse, summary="Check text for plagiarism using AI")
async def check_plagiarism(request: PlagiarismCheckRequest):
    """
    Processes the submitted text for plagiarism.
    NOTE: This is a simplified example. A real plagiarism check requires
    comparison against a large database of existing texts. This example
    uses OpenAI for a conceptual "originality" assessment based on prompt.
    """
    if not client.api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured in AI service.")

    try:
        # Craft a prompt for OpenAI to "assess originality"
        # For a real plagiarism check, you'd integrate with a dedicated plagiarism API
        # or implement a much more complex comparison algorithm.
        prompt = (
            f"Analyze the following academic text for its originality and provide a numerical originality "
            f"score between 0 (fully plagiarized) and 100 (fully original), followed by a brief textual feedback "
            f"explaining the score. Focus on common patterns of unoriginality. \n\nText: '{request.text[:4000]}'" # Limit text length for prompt
        )
        # You might want to use a more powerful model like "gpt-4" if available and budget allows
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an AI assistant specialized in analyzing text originality and providing concise feedback."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=300, # Adjust as needed for feedback length
            temperature=0.7 # Adjust creativity (lower for more factual, higher for more creative)
        )

        ai_full_response = response.choices[0].message.content.strip()

        # Attempt to parse originality score from AI's response (this part is crucial and fragile)
        originality_score = 0.0
        feedback_text = "Could not parse specific originality score from AI response. Please review the full feedback."

        # A more robust parsing method would involve regex or more sophisticated NLP
        import re
        score_match = re.search(r"score.*?(\d+(\.\d+)?)", ai_full_response, re.IGNORECASE)
        if score_match:
            try:
                originality_score = float(score_match.group(1))
                # Ensure score is within valid range
                originality_score = max(0.0, min(100.0, originality_score))
            except ValueError:
                pass # Keep default if parsing fails

        feedback_text = ai_full_response # For now, return the full AI response as feedback

        return PlagiarismCheckResponse(
            originality_score=originality_score,
            feedback=feedback_text
        )

    except Exception as e:
        print(f"Error during plagiarism check: {e}") # Log the actual error for debugging
        raise HTTPException(status_code=500, detail=f"AI plagiarism service error: {str(e)}")
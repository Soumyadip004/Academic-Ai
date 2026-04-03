from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from backend.services.chat_service import get_llm_response

router = APIRouter(prefix="/api/summarize", tags=["AI Summarization"])

class SummarizeRequest(BaseModel):
    text: str
    type: str = "executive" # "executive", "bullets", "actions"

@router.post("/")
async def summarize_text(req: SummarizeRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    if len(req.text.split()) > 3000: # Example limit
        raise HTTPException(status_code=400, detail="Text too long (max 3000 words)")

    prompts = {
        "executive": (
            "Summarize the following text into a high-level executive summary. "
            "Focus on the main strategic points and overall intent. "
            "Use academic and professional tone."
        ),
        "bullets": (
            "Summarize the following text into key takeaways using bullet points. "
            "Be concise and focus on facts and results."
        ),
        "actions": (
            "Extract clear action items and next steps from the following text. "
            "Use a numbered list and be very specific about what needs to be done."
        )
    }
    
    system_prompt = prompts.get(req.type, prompts["executive"])
    user_prompt = f"TEXT TO SUMMARIZE:\n\n{req.text}"
    
    try:
        summary = get_llm_response(system_prompt=system_prompt, user_prompt=user_prompt)
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

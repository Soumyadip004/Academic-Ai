import json
import logging
import re

from backend.models.schemas import SpellCheckResponse, SpellError
from backend.services.chat_service import get_llm_response

logger = logging.getLogger(__name__)

def check_text(text: str, language: str = "en-US") -> SpellCheckResponse:
    """Check *text* for spelling and grammar errors using LLM.

    Returns the original text, the corrected version, and a list of
    individual errors with positions and replacement suggestions.
    """
    if not text.strip():
        return SpellCheckResponse(
            original_text=text,
            corrected_text=text,
            errors=[],
            error_count=0,
        )

    system_prompt = (
        "You are an expert editor. Analyze the following text for spelling and grammar errors. "
        "Return your response ONLY as a JSON object with the following structure: "
        '{"corrected_text": "...", "errors": [{"message": "...", "offset": 0, "length": 5, "replacements": ["..."], "context": "...", "rule_id": "..."}]}'
    )
    
    user_prompt = f"Text to check (language: {language}):\n\n{text}"

    try:
        response_text = get_llm_response(system_prompt, user_prompt)
        # Attempt to extract JSON if LLM included boilerplate
        match = re.search(r"\{.*\}", response_text, re.DOTALL)
        if match:
            response_json = json.loads(match.group(0))
        else:
            response_json = json.loads(response_text)
            
        corrected = response_json.get("corrected_text", text)
        raw_errors = response_json.get("errors", [])
        
        errors = [
            SpellError(
                message=e.get("message", "Error"),
                offset=e.get("offset", 0),
                length=e.get("length", 0),
                replacements=e.get("replacements", [])[:5],
                context=e.get("context", ""),
                rule_id=e.get("rule_id", "llm-check"),
            )
            for e in raw_errors
        ]

        return SpellCheckResponse(
            original_text=text,
            corrected_text=corrected,
            errors=errors,
            error_count=len(errors),
        )
    except Exception as exc:
        logger.error("LLM Spellcheck failed: %s", exc)
        # Fallback to returning original text with no errors if LLM fails
        return SpellCheckResponse(
            original_text=text,
            corrected_text=text,
            errors=[],
            error_count=0,
        )

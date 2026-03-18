"""LLM chat service with conversation memory — supports Groq, OpenAI, Ollama."""

from __future__ import annotations

import logging
from collections import defaultdict

from backend.config import settings

logger = logging.getLogger(__name__)

# ── Conversation memory ────────────────────────────────────────────────────
_chat_memory: dict[str, list[dict[str, str]]] = defaultdict(list)
MAX_HISTORY = 20


# ── Public API ──────────────────────────────────────────────────────────────

def chat(message: str, session_id: str = "default") -> str:
    """Send a message to the general-purpose AI assistant and return the reply."""
    history = _chat_memory[session_id]

    system_prompt = (
        "You are a helpful academic assistant. You help students and "
        "researchers with writing, summarising, brainstorming, and answering "
        "questions. Be clear, thorough, and supportive."
    )

    # Build message list for the LLM
    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(history[-MAX_HISTORY:])
    messages.append({"role": "user", "content": message})

    reply = _call_llm(messages)

    # Persist the turn
    _chat_memory[session_id].append({"role": "user", "content": message})
    _chat_memory[session_id].append({"role": "assistant", "content": reply})

    # Trim memory
    if len(_chat_memory[session_id]) > MAX_HISTORY * 2:
        _chat_memory[session_id] = _chat_memory[session_id][-(MAX_HISTORY * 2):]

    return reply


def get_llm_response(system_prompt: str, user_prompt: str) -> str:
    """One-shot LLM call (used by RAG and other services)."""
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]
    return _call_llm(messages)


# ── Private helpers ─────────────────────────────────────────────────────────

def _call_llm(messages: list[dict[str, str]]) -> str:
    """Route an LLM call to the configured provider."""
    provider = settings.llm_provider.lower()

    if provider == "groq":
        return _call_groq(messages)
    elif provider == "openai":
        return _call_openai(messages)
    elif provider == "ollama":
        return _call_ollama(messages)
    else:
        raise ValueError(f"Unknown LLM provider: {provider}")


def _call_groq(messages: list[dict[str, str]]) -> str:
    from groq import Groq

    client = Groq(api_key=settings.groq_api_key)
    response = client.chat.completions.create(
        model=settings.groq_model,
        messages=messages,
        temperature=0.3,
        max_tokens=2048,
    )
    return response.choices[0].message.content.strip()


def _call_openai(messages: list[dict[str, str]]) -> str:
    from openai import OpenAI

    client = OpenAI(api_key=settings.openai_api_key)
    response = client.chat.completions.create(
        model=settings.openai_model,
        messages=messages,
        temperature=0.3,
        max_tokens=2048,
    )
    return response.choices[0].message.content.strip()


def _call_ollama(messages: list[dict[str, str]]) -> str:
    import requests as _requests

    url = f"{settings.ollama_base_url}/api/chat"
    payload = {
        "model": settings.ollama_model,
        "messages": messages,
        "stream": False,
        "options": {"temperature": 0.3},
    }
    resp = _requests.post(url, json=payload, timeout=120)
    resp.raise_for_status()
    return resp.json()["message"]["content"].strip()

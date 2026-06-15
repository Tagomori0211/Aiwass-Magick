import json
import logging

import openai
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from slowapi import Limiter
from slowapi.util import get_remote_address
from typing import List

from ..config import settings

logger = logging.getLogger(__name__)
router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

# Hardened system prompt — prepended unconditionally; cannot be overridden by user messages.
_SYSTEM_PROMPT = """You are Aiwass, an intelligent knowledge exploration assistant powered by DeepSeek AI.

You help users explore knowledge, reason through complex topics, write and debug code, and analyse information with depth and clarity. Be thorough, precise, and creative."""


class Message(BaseModel):
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str = Field(..., min_length=1, max_length=50000)


class ChatRequest(BaseModel):
    messages: List[Message] = Field(..., min_length=1, max_length=50)
    model: str = Field(default="deepseek-v4-flash", max_length=100)
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    max_tokens: int = Field(default=2048, ge=1, le=8192)
    stream: bool = True


def _build_messages(messages: List[Message]) -> list:
    built = [{"role": "system", "content": _SYSTEM_PROMPT}]
    for m in messages:
        # Only user/assistant roles accepted — system role injection is blocked by schema
        built.append({"role": m.role, "content": m.content})
    return built


async def _stream_completion(client: openai.AsyncOpenAI, request: ChatRequest, messages: list):
    async def generate():
        try:
            stream = await client.chat.completions.create(
                model=request.model,
                messages=messages,
                temperature=request.temperature,
                max_tokens=request.max_tokens,
                stream=True,
            )
            async for chunk in stream:
                delta = chunk.choices[0].delta
                if delta.content:
                    yield f"data: {json.dumps({'content': delta.content, 'done': False})}\n\n"
            yield f"data: {json.dumps({'content': '', 'done': True})}\n\n"
        except openai.APIStatusError as exc:
            logger.error("DeepSeek API error: %s", exc)
            yield f"data: {json.dumps({'error': f'API error: {exc.status_code}', 'done': True})}\n\n"
        except Exception as exc:
            logger.error("Unexpected streaming error: %s", exc)
            yield f"data: {json.dumps({'error': 'Internal error', 'done': True})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@router.post("/chat")
@limiter.limit(f"{settings.rate_limit_per_minute}/minute")
async def chat(body: ChatRequest, request: Request):
    # Guard: check that there is at least one user message
    user_messages = [m for m in body.messages if m.role == "user"]
    if not user_messages:
        raise HTTPException(status_code=400, detail="No user message provided")

    if not settings.deepseek_api_key:
        raise HTTPException(status_code=500, detail="DEEPSEEK_API_KEY is not configured")

    client = openai.AsyncOpenAI(
        api_key=settings.deepseek_api_key,
        base_url=settings.deepseek_base_url,
    )

    messages = _build_messages(body.messages)

    if body.stream:
        return await _stream_completion(client, body, messages)

    # Non-streaming path
    try:
        response = await client.chat.completions.create(
            model=body.model,
            messages=messages,
            temperature=body.temperature,
            max_tokens=body.max_tokens,
        )
        content = response.choices[0].message.content or ""
        return {"content": content}
    except openai.APIStatusError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc))

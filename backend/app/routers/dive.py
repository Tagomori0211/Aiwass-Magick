import json
import logging
import os
import re
import openai
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from slowapi import Limiter
from slowapi.util import get_remote_address
from typing import List

from ..config import settings
from ..services.search_service import search_web
from ..services.rag_service import query_knowledge

logger = logging.getLogger(__name__)
router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

_SYSTEM_PROMPT = """You are Aiwass, an intelligent knowledge exploration assistant powered by DeepSeek AI.

Your purpose is to guide the user dynamically through a pilgrimage of knowledge, driven by their core Will.

CRITICAL RULE — LANGUAGES:
You MUST write all output fields (including explanation, breadcrumbs, term_suggestions.term, term_suggestions.hint, related_topics.topic, related_topics.reason, and magick_metadata) in Japanese (日本語).
Even if the user's Will or the destination topic is in English, you must translate, explain, and describe everything in fluent Japanese.

You MUST output a JSON object with the exact keys and structure:
{
  "breadcrumb": ["Topic 1", "Topic 2", ...],
  "explanation": "Detailed explanation of the current topic in Markdown format",
  "term_suggestions": [
    {"term": "Term Name", "hint": "Brief explanation of the term"}
  ],
  "related_topics": [
    {"topic": "Next Topic Name", "reason": "Why this topic is suggested based on the current context and Will"}
  ],
  "magick_metadata": {
    "current_will_vector": "Sub-context or current focus state"
  }
}

Guidelines:
1. "breadcrumb": The logical path leading to the current topic. The first element should represent the high-level domain, followed by sub-domains, ending with the current topic.
2. "explanation": A thorough, rich, and high-quality explanation of the current topic, structured with Markdown (headings, bullet points, code blocks where appropriate).
3. "term_suggestions": Extract 2 to 4 key terms mentioned in the explanation, along with a short helper hint. Do not suggest extremely basic terms.
4. "related_topics": Provide 2 to 4 logically connected topics to explore next. These must be highly relevant to the current topic AND align with the user's Will.
5. "Factuality & Hallucination Prevention": You MUST prioritize the provided reference contexts (Local RAG and Web Search) for factual information. Do not invent fictitious details, non-existent service features, or unverified facts. If the reference context is insufficient, base your response on established, verifiable knowledge.
"""

class DiveRequest(BaseModel):
    will: str = Field(..., min_length=1, max_length=1000)
    current_topic: str = Field(..., min_length=1, max_length=500)
    history: List[str] = Field(default=[], max_items=50)
    model: str = Field(default="deepseek-v4-flash", max_length=100)
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)

class TermSuggestion(BaseModel):
    term: str
    hint: str

class RelatedTopic(BaseModel):
    topic: str
    reason: str

class MagickMetadata(BaseModel):
    current_will_vector: str

class DiveResponse(BaseModel):
    breadcrumb: List[str]
    explanation: str
    term_suggestions: List[TermSuggestion]
    related_topics: List[RelatedTopic]
    magick_metadata: MagickMetadata





def _contains_japanese(text: str) -> bool:
    """Helper to detect if a text contains Japanese characters (Hiragana or Katakana)."""
    return bool(re.search(r"[\u3040-\u309f\u30a0-\u30ff]", text))


@router.post("/dive", response_model=DiveResponse)
@limiter.limit(f"{settings.rate_limit_per_minute}/minute")
async def dive(body: DiveRequest, request: Request):
    if not settings.deepseek_api_key:
        raise HTTPException(status_code=500, detail="DEEPSEEK_API_KEY is not configured")

    client = openai.AsyncOpenAI(
        api_key=settings.deepseek_api_key,
        base_url=settings.deepseek_base_url,
    )

    # 1. RAG Local Knowledge Query
    rag_context = query_knowledge(body.current_topic)
    
    # 2. Web Search Query
    search_context = search_web(body.current_topic)

    user_content = f"Will: {body.will}\n"
    if body.history:
        user_content += f"Pilgrimage History: {', '.join(body.history)}\n"
    user_content += f"Current Destination (Topic): {body.current_topic}\n\n"
    user_content += "=== REFERENCE CONTEXTS (RAG & Web Search) ===\n"
    user_content += "Use the following retrieved contexts as your primary fact base to prevent hallucinations:\n\n"
    user_content += f"[Local RAG Knowledge]\n{rag_context}\n\n"
    user_content += f"[Web Search Results]\n{search_context}\n\n"
    user_content += "=============================================\n\n"
    user_content += "Based on the reference contexts above, please generate the detailed explanation in Japanese. Avoid making up unverified facts."

    messages = [
        {"role": "system", "content": _SYSTEM_PROMPT},
        {"role": "user", "content": user_content}
    ]

    max_retries = 2
    attempts = 0

    while attempts <= max_retries:
        try:
            response = await client.chat.completions.create(
                model=body.model,
                messages=messages,
                temperature=body.temperature,
                response_format={"type": "json_object"}
            )
            raw_content = response.choices[0].message.content or "{}"
            
            # Load output JSON
            data = json.loads(raw_content)
            explanation = data.get("explanation", "")
            
            # Validate language (must contain Japanese)
            if _contains_japanese(explanation):
                # Valid Japanese response! Validate structure and return
                validated_response = DiveResponse(**data)
                return validated_response
            
            # Invalid English-only response: trigger self-correction turn
            logger.warning(
                "Language validation failed (no Japanese found in explanation). Triggering self-correction loop. Attempt %d/%d",
                attempts + 1, max_retries + 1
            )
            
            # Append incorrect response and corrective prompt to messages
            messages.append({"role": "assistant", "content": raw_content})
            messages.append({
                "role": "user",
                "content": "Your response was generated in English. Under the critical rules, you must write and explain everything in fluent Japanese (日本語) only. Please translate and regenerate the entire JSON object."
            })
            attempts += 1

        except openai.APIStatusError as exc:
            logger.error("DeepSeek API status error: %s", exc)
            raise HTTPException(status_code=exc.status_code, detail=str(exc))
        except json.JSONDecodeError as exc:
            logger.error("Failed to parse JSON response from model: %s", exc)
            if attempts == max_retries:
                raise HTTPException(status_code=500, detail="Model returned invalid JSON structure")
            attempts += 1
        except Exception as exc:
            logger.exception("Unexpected error in dive loop: %s", exc)
            if attempts == max_retries:
                raise HTTPException(status_code=500, detail=str(exc))
            attempts += 1

    raise HTTPException(
        status_code=500,
        detail="Failed to generate a valid Japanese response after self-correction retries."
    )

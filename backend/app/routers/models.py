import logging

import openai
from fastapi import APIRouter

from ..config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

# Fallback list when the API is unreachable or returns nothing
_FALLBACK_MODELS = [
    {"id": "deepseek-v4-flash", "description": "Fast & efficient — 284B params, best for most tasks"},
    {"id": "deepseek-v4-pro", "description": "Most capable — 1.6T params, complex reasoning & agentic workflows"},
]


@router.get("/models")
async def list_models():
    try:
        client = openai.AsyncOpenAI(
            api_key=settings.deepseek_api_key,
            base_url=settings.deepseek_base_url,
        )
        response = await client.models.list()
        models = [{"id": m.id, "description": ""} for m in response.data if m.id]
        if models:
            return {"models": models, "default": settings.default_model}
    except Exception as exc:
        logger.warning("Could not fetch remote model list: %s", exc)

    return {"models": _FALLBACK_MODELS, "default": settings.default_model}

import os
import logging
import httpx
from duckduckgo_search import DDGS

logger = logging.getLogger("uvicorn.error")

def search_web(query: str, max_results: int = 3) -> str:
    """
    Search the web for the given query.
    Prioritizes Tavily API if TAVILY_API_KEY is present, falls back to duckduckgo-search.
    """
    tavily_key = os.getenv("TAVILY_API_KEY")
    
    if tavily_key:
        logger.info(f"RAG Search: Attempting search via Tavily for query: '{query}'")
        try:
            url = "https://api.tavily.com/search"
            payload = {
                "api_key": tavily_key,
                "query": query,
                "search_depth": "basic",
                "max_results": max_results
            }
            with httpx.Client(timeout=10.0) as client:
                response = client.post(url, json=payload)
                if response.status_code == 200:
                    data = response.json()
                    results = data.get("results", [])
                    formatted = []
                    for r in results:
                        formatted.append(
                            f"Source: {r.get('url')}\n"
                            f"Title: {r.get('title')}\n"
                            f"Content: {r.get('content')}"
                        )
                    logger.info("RAG Search: Successfully retrieved results from Tavily.")
                    return "\n\n---\n\n".join(formatted)
                else:
                    logger.warning(f"RAG Search: Tavily API returned status code {response.status_code}. Falling back to DuckDuckGo.")
        except Exception as e:
            logger.error(f"RAG Search: Tavily search error: {e}. Falling back to DuckDuckGo.")

    # Fallback to DuckDuckGo
    logger.info(f"RAG Search: Attempting search via DuckDuckGo for query: '{query}'")
    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=max_results))
            if results:
                formatted = []
                for r in results:
                    formatted.append(
                        f"Source: {r.get('href')}\n"
                        f"Title: {r.get('title')}\n"
                        f"Content: {r.get('body')}"
                    )
                logger.info("RAG Search: Successfully retrieved results from DuckDuckGo.")
                return "\n\n---\n\n".join(formatted)
            else:
                logger.warning("RAG Search: DuckDuckGo returned no results.")
    except Exception as e:
        logger.error(f"RAG Search: DuckDuckGo search error: {e}")
        
    return "No search results available."

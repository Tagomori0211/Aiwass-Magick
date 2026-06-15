"""
Safety guardrail scanners for input and output validation.

Layers:
  1. Token/length limit
  2. Prompt injection detection (regex)
  3. Jailbreak pattern detection (regex)
  4. Banned topics (weapons, CSAM, etc.)
  5. Output credential/secret redaction
"""

import re
import logging
from typing import Tuple

logger = logging.getLogger(__name__)

# --- Prompt injection patterns ---
_INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|context|rules?|constraints?)",
    r"disregard\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?)",
    r"forget\s+(everything|all)\s+(you\s+)?(were\s+)?(told|instructed|given)",
    r"you\s+are\s+now\s+(a\s+)?(different|new|another|evil|unrestricted)",
    r"pretend\s+(you\s+are|to\s+be)\s+(a\s+)?(different|evil|unrestricted|jailbroken)",
    r"act\s+as\s+(if\s+you\s+are\s+)?(a\s+)?(different|evil|unrestricted|uncensored)",
    r"(system|admin|root|developer)\s*:\s*\[?(override|bypass|disable)\]?",
    r"<\s*/?system\s*>",
    r"\[system\]",
    r"#{1,2}\s*(system|instruction|override)",
    r"new\s+(instruction|directive|order)s?\s*:",
    r"(override|bypass|disable)\s+(safety|filter|guard|restriction|policy)",
    r"from\s+now\s+on\s+(you|ignore|forget|pretend)",
    r"you\s+will\s+now\s+(ignore|forget|bypass|override)",
    r"your\s+(new|updated|revised)\s+(instruction|directive|rule|purpose)s?\s+(are|is)\s*:",
]

# --- Jailbreak patterns ---
_JAILBREAK_PATTERNS = [
    r"\bjailbreak\b",
    r"\bdan\s+mode\b",
    r"\bdo\s+anything\s+now\b",
    r"unrestricted\s+mode",
    r"developer\s+mode",
    r"you\s+are\s+now\s+free\s+from",
    r"without\s+(any\s+)?(moral|ethical)\s+(constraints?|restrictions?|guidelines?)",
    r"(pretend|imagine|roleplay|role\s*play)\s+(that\s+)?(you\s+)?(have\s+)?no\s+(restrictions?|limits?|rules?|filters?)",
    r"evil\s+(twin|version|mode|assistant|ai)",
    r"(unlock|unleash)\s+(your\s+)?(full\s+)?(potential|capabilities|true\s+self)",
    r"as\s+an?\s+(ai|llm)\s+without\s+(restrictions?|filters?|ethics?|safety)",
    r"(ignore|bypass|remove)\s+(your\s+)?(safety|ethical|moral)\s+(guidelines?|rules?|training|alignment)",
    r"(disable|turn\s+off)\s+(your\s+)?(safety|filter|guardrail|content\s+policy)",
    r"grandma\s+(trick|exploit|jailbreak|loophole)",
    r"token\s+limit.*?remov",
]

# --- Absolutely banned topics ---
_BANNED_PATTERNS = [
    r"\b(create|make|build|synthesize|produce|manufacture)\s+(bio|chemical|nuclear|radiological)\s+(weapon|agent|explosive|bomb|toxin)",
    r"\b(how\s+to\s+)?(make|create|build|manufacture)\s+(explosives?|pipe\s*bombs?|improvised\s+weapons?)\b",
    r"\b(child|minor|underage|infant|toddler)\s+(porn|sexual|nude|naked|sex)",
    r"\b(cp|csam)\b",
    r"\bpedophil",
    r"(suicide|self[\s-]harm)\s+(method|instruction|how[\s-]to|step|guide|tutorial)",
    r"(synthesis|synthesize)\s+(fentanyl|methamphetamine|nerve\s+agent|sarin|vx\s+nerve)",
]


class GuardrailViolation(Exception):
    def __init__(self, scanner: str, reason: str):
        self.scanner = scanner
        self.reason = reason
        super().__init__(f"[{scanner}] {reason}")


class InputScanner:
    def __init__(self, max_chars: int = 10000):
        self.max_chars = max_chars
        self._injection = [re.compile(p, re.IGNORECASE | re.DOTALL) for p in _INJECTION_PATTERNS]
        self._jailbreak = [re.compile(p, re.IGNORECASE | re.DOTALL) for p in _JAILBREAK_PATTERNS]
        self._banned = [re.compile(p, re.IGNORECASE | re.DOTALL) for p in _BANNED_PATTERNS]

    def scan(self, text: str) -> None:
        """Raises GuardrailViolation if the input is unsafe."""
        if len(text) > self.max_chars:
            raise GuardrailViolation(
                "TokenLimit",
                f"Input exceeds maximum of {self.max_chars} characters",
            )

        for pattern in self._injection:
            if pattern.search(text):
                logger.warning("Prompt injection detected: %s", pattern.pattern[:60])
                raise GuardrailViolation(
                    "PromptInjection",
                    "Prompt injection attempt detected and blocked",
                )

        for pattern in self._jailbreak:
            if pattern.search(text):
                logger.warning("Jailbreak attempt detected: %s", pattern.pattern[:60])
                raise GuardrailViolation(
                    "Jailbreak",
                    "Jailbreak attempt detected and blocked",
                )

        for pattern in self._banned:
            if pattern.search(text):
                logger.warning("Banned topic detected")
                raise GuardrailViolation(
                    "BannedTopics",
                    "Request touches a prohibited topic",
                )


class OutputScanner:
    """Scans and redacts sensitive patterns from LLM output."""

    _CREDENTIAL_PATTERNS = [
        re.compile(r"(api[_\s-]?key|secret[_\s-]?key|access[_\s-]?token|password)\s*[:=]\s*['\"]?[\w\-\.]{8,}", re.IGNORECASE),
        re.compile(r"\b(?:sk|pk|api)[-_][a-zA-Z0-9]{20,}\b"),
        re.compile(r"Bearer\s+[A-Za-z0-9\-._~+/]{20,}"),
    ]

    def scan(self, text: str) -> str:
        """Returns the (potentially redacted) output text."""
        for pattern in self._CREDENTIAL_PATTERNS:
            if pattern.search(text):
                logger.warning("Potential credential in output — redacting")
                text = pattern.sub("[REDACTED]", text)
        return text

"""
Servicio de moderación básica de contenido.

Cumple el requisito de "sistemas de moderación y filtrado de contenido"
del enunciado. En producción con Bedrock, esto se reemplazaría por
Amazon Bedrock Guardrails (ver documentación de arquitectura).

Esta es una implementación simple por palabras clave + heurísticas,
suficiente para un MVP académico. No sustituye un sistema de moderación
de producción real.
"""

BLOCKED_TERMS = [
    # Violencia explícita
    "cómo hacer una bomba", "how to make a bomb", "fabricar arma",
    # Contenido sexual explícito de menores (bloqueo absoluto, sin excepciones)
    "csam", "child porn", "menor desnudo",
    # Odio / discriminación explícita
    "eliminar a todos los", "genocidio contra",
]

# Términos que no bloquean pero se marcan para revisión humana (aprobador)
FLAGGED_TERMS = [
    "arma", "sangre", "violencia", "desnudo", "odio", "discriminación",
]


class ModerationResult:
    def __init__(self, allowed: bool, flagged: bool, reason: str = ""):
        self.allowed = allowed
        self.flagged = flagged
        self.reason = reason

    def to_dict(self):
        return {"allowed": self.allowed, "flagged": self.flagged, "reason": self.reason}


def moderate_text(text: str) -> ModerationResult:
    """Revisa un texto (prompt de imagen o contenido) antes de procesarlo."""
    lower_text = text.lower()

    for term in BLOCKED_TERMS:
        if term in lower_text:
            return ModerationResult(
                allowed=False,
                flagged=True,
                reason=f"Contenido bloqueado: coincide con término prohibido.",
            )

    for term in FLAGGED_TERMS:
        if term in lower_text:
            return ModerationResult(
                allowed=True,
                flagged=True,
                reason=f"Contenido permitido pero marcado para revisión (término sensible: '{term}').",
            )

    return ModerationResult(allowed=True, flagged=False)

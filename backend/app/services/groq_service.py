"""
Servicio de edición y mejora de contenido de texto.

Reemplazo gratuito de "Claude vía Amazon Bedrock" para este prototipo.
Usa la API de Groq (gratuita, muy rápida, modelos LLaMA) para simular
el mismo rol que tendría Claude: resumir, expandir, corregir y generar
variaciones de texto.

Mapeo a producción: ver docs/arquitectura-bedrock.md
    GroqService.edit_content()  ->  bedrock-runtime.invoke_model()
    (modelo: anthropic.claude-3-5-sonnet vía Bedrock)
"""

from groq import Groq

from app.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)

# Prompts de sistema por tipo de operación
OPERATION_PROMPTS = {
    "resumir": (
        "Eres un editor de contenido publicitario experto. Resume el siguiente texto "
        "manteniendo las ideas clave y el tono original. Sé conciso."
    ),
    "expandir": (
        "Eres un redactor creativo experto en marketing. Expande el siguiente texto "
        "añadiendo más detalle, ejemplos o contexto persuasivo, manteniendo el tono original."
    ),
    "corregir": (
        "Eres un corrector de estilo y gramática profesional. Corrige errores gramaticales, "
        "ortográficos y de estilo del siguiente texto. Devuelve solo el texto corregido, "
        "sin explicaciones."
    ),
    "variacion": (
        "Eres un redactor creativo. Genera una variación alternativa del siguiente texto, "
        "con un enfoque o ángulo distinto, pero manteniendo el mismo mensaje central."
    ),
}


def edit_content(text: str, operation: str) -> str:
    """
    Aplica una operación de edición sobre un texto: resumir, expandir,
    corregir o generar variación.
    """
    system_prompt = OPERATION_PROMPTS.get(operation)
    if not system_prompt:
        raise ValueError(f"Operación no soportada: {operation}")

    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": text},
        ],
        temperature=0.7,
        max_tokens=1024,
    )

    return response.choices[0].message.content

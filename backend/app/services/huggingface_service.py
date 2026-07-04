"""
Servicio de generación de imágenes.

Reemplazo gratuito de "Stable Diffusion vía Amazon Bedrock" para este
prototipo. Usa la librería oficial `huggingface_hub`, que selecciona
automáticamente un proveedor de inferencia disponible para el modelo
pedido (Hugging Face unificó su API bajo router.huggingface.co y
varios proveedores externos; la librería abstrae esos detalles).

Mapeo a producción: ver docs/arquitectura-bedrock.md
    generate_image()  ->  bedrock-runtime.invoke_model()
    (modelo: stability.stable-diffusion-xl o amazon.titan-image-generator)
"""

import asyncio
import base64
from io import BytesIO

from huggingface_hub import InferenceClient
from huggingface_hub.errors import HfHubHTTPError

from app.config import settings

_client = InferenceClient(api_key=settings.HF_API_TOKEN, provider="auto")

STYLE_PRESETS = {
    "anime": "anime style, vibrant colors, cel shading, ",
    "oleo": "oil painting, textured brush strokes, classical art, ",
    "realismo": "photorealistic, highly detailed, 8k, professional photography, ",
    "acuarela": "watercolor painting, soft edges, pastel tones, ",
    "cyberpunk": "cyberpunk style, neon lights, futuristic, high contrast, ",
    "ninguno": "",
}


def _generate_image_sync(full_prompt: str) -> bytes:
    try:
        image = _client.text_to_image(full_prompt, model=settings.HF_MODEL_ID)
    except HfHubHTTPError as e:
        status = getattr(e.response, "status_code", None)
        if status == 503:
            raise RuntimeError(
                "El modelo se está inicializando en Hugging Face, intenta de nuevo en ~20s."
            )
        raise RuntimeError(f"Error de Hugging Face API ({status}): {e}")

    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()


async def generate_image(prompt: str, style: str = "ninguno") -> bytes:
    """
    Genera una imagen a partir de un prompt de texto y un estilo.
    Devuelve los bytes de la imagen (PNG) para que el caller la suba
    a Supabase Storage.
    """
    style_prefix = STYLE_PRESETS.get(style, "")
    full_prompt = f"{style_prefix}{prompt}"

    # huggingface_hub es síncrono; lo corremos en un thread para no bloquear FastAPI
    return await asyncio.to_thread(_generate_image_sync, full_prompt)


def image_bytes_to_base64(image_bytes: bytes) -> str:
    return base64.b64encode(image_bytes).decode("utf-8")
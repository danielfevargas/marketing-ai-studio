from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.dependencies import require_permission
from app.services import groq_service, supabase_service
from app.services.moderation_service import moderate_text

router = APIRouter(prefix="/api/content", tags=["content"])


class EditContentRequest(BaseModel):
    project_id: str
    text: str
    operation: str  # resumir | expandir | corregir | variacion


@router.post("/edit")
async def edit_content(
    body: EditContentRequest,
    user: dict = Depends(require_permission("edit_content")),
):
    moderation = moderate_text(body.text)
    if not moderation.allowed:
        raise HTTPException(status_code=400, detail=moderation.reason)

    if body.operation not in {"resumir", "expandir", "corregir", "variacion"}:
        raise HTTPException(status_code=400, detail="Operación no soportada.")

    try:
        result_text = groq_service.edit_content(body.text, body.operation)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Error al procesar el texto: {e}")

    version = supabase_service.save_content_version(
        project_id=body.project_id,
        user_id=user["id"],
        content=result_text,
        operation=body.operation,
    )

    return {"result": result_text, "version": version}


@router.get("/history/{project_id}")
async def get_history(project_id: str, user: dict = Depends(require_permission("comment"))):
    history = supabase_service.get_content_history(project_id)
    return {"history": history}


class RevertRequest(BaseModel):
    project_id: str
    version_id: str
    content: str


@router.post("/revert")
async def revert_version(
    body: RevertRequest,
    user: dict = Depends(require_permission("edit_content")),
):
    """
    Revertir no borra historial: crea una NUEVA versión con el contenido
    de una versión anterior. Así el historial completo queda trazable.
    """
    version = supabase_service.save_content_version(
        project_id=body.project_id,
        user_id=user["id"],
        content=body.content,
        operation="revertido",
    )
    return {"version": version}

@router.patch("/versions/{version_id}/approve")
async def approve_version(version_id: str, user: dict = Depends(require_permission("approve_content"))):
    version = supabase_service.approve_content_version(version_id)
    return {"version": version}
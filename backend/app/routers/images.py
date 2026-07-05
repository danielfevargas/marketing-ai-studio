from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.dependencies import require_permission
from app.services import huggingface_service, supabase_service
from app.services.moderation_service import moderate_text

router = APIRouter(prefix="/api/images", tags=["images"])


class GenerateImageRequest(BaseModel):
    prompt: str
    style: str = "ninguno"


@router.post("/generate")
async def generate_image(
    body: GenerateImageRequest,
    user: dict = Depends(require_permission("generate_image")),
):
    moderation = moderate_text(body.prompt)
    if not moderation.allowed:
        raise HTTPException(status_code=400, detail=moderation.reason)

    try:
        image_bytes = await huggingface_service.generate_image(body.prompt, body.style)
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))

    image_url = supabase_service.upload_image(image_bytes)
    record = supabase_service.save_image_record(
        team_id=user["team_id"],
        user_id=user["id"],
        prompt=body.prompt,
        style=body.style,
        image_url=image_url,
        flagged=moderation.flagged,
    )

    return {"image": record, "moderation": moderation.to_dict()}


@router.get("/gallery")
async def get_gallery(user: dict = Depends(require_permission("comment"))):
    images = supabase_service.get_gallery(user["team_id"])
    return {"images": images}


@router.patch("/{image_id}/approve")
async def approve_image(image_id: str, user: dict = Depends(require_permission("approve_content"))):
    image = supabase_service.approve_image(user["team_id"], image_id)
    return {"image": image}
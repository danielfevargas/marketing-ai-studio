from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.dependencies import require_permission
from app.services import supabase_service

router = APIRouter(prefix="/api/collaboration", tags=["collaboration"])


class CommentRequest(BaseModel):
    project_id: str
    text: str


@router.post("/comments")
async def add_comment(body: CommentRequest, user: dict = Depends(require_permission("comment"))):
    project_team = supabase_service.get_project_team_id(body.project_id)
    if project_team != user["team_id"]:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado en tu equipo.")
    comment = supabase_service.add_comment(user["team_id"], body.project_id, user["id"], body.text)
    return {"comment": comment}


@router.get("/comments/{project_id}")
async def get_comments(project_id: str, user: dict = Depends(require_permission("comment"))):
    project_team = supabase_service.get_project_team_id(project_id)
    if project_team != user["team_id"]:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado en tu equipo.")
    comments = supabase_service.get_comments(project_id)
    return {"comments": comments}
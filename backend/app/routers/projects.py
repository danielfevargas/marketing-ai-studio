from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.dependencies import require_permission
from app.services import supabase_service

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.get("")
async def list_projects(user: dict = Depends(require_permission("comment"))):
    projects = supabase_service.list_projects()
    return {"projects": projects}


class CreateProjectRequest(BaseModel):
    name: str


@router.post("")
async def create_project(
    body: CreateProjectRequest,
    user: dict = Depends(require_permission("comment")),
):
    project = supabase_service.create_project(body.name, user["id"])
    return {"project": project}
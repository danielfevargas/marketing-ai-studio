from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.dependencies import require_permission
from app.services import supabase_service

router = APIRouter(prefix="/api/users", tags=["users"])

VALID_ROLES = {"designer", "writer", "approver", "admin"}


@router.get("")
async def list_users(user: dict = Depends(require_permission("manage_users"))):
    users = supabase_service.list_users_with_roles()
    return {"users": users}


class UpdateRoleRequest(BaseModel):
    role: str


@router.patch("/{user_id}/role")
async def update_role(
    user_id: str,
    body: UpdateRoleRequest,
    user: dict = Depends(require_permission("manage_users")),
):
    if body.role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail=f"Rol inválido. Usa uno de: {VALID_ROLES}")

    updated = supabase_service.update_user_role(user_id, body.role)
    return {"user": updated}
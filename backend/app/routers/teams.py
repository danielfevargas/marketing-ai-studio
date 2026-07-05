from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.dependencies import get_current_user, require_permission, require_team
from app.services import supabase_service

router = APIRouter(prefix="/api/teams", tags=["teams"])


@router.get("/me")
async def get_my_team(user: dict = Depends(get_current_user)):
    if not user["team_id"]:
        return {"team": None}
    return {
        "team": {
            "id": user["team_id"],
            "name": user["team_name"],
            "role": user["role"],
            "invite_code": user["invite_code"] if user["role"] == "admin" else None,
        }
    }


class CreateTeamRequest(BaseModel):
    name: str


@router.post("/create")
async def create_team(body: CreateTeamRequest, user: dict = Depends(get_current_user)):
    if user["team_id"]:
        raise HTTPException(status_code=400, detail="Ya perteneces a un equipo.")
    team = supabase_service.create_team(body.name, user["id"])
    return {"team": team}


class JoinTeamRequest(BaseModel):
    invite_code: str


@router.post("/join")
async def join_team(body: JoinTeamRequest, user: dict = Depends(get_current_user)):
    if user["team_id"]:
        raise HTTPException(status_code=400, detail="Ya perteneces a un equipo.")
    try:
        team = supabase_service.join_team(body.invite_code, user["id"])
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return {"team": team}


@router.get("/members")
async def get_members(user: dict = Depends(require_team)):
    members = supabase_service.get_team_members(user["team_id"])
    return {"members": members}


class UpdateRoleRequest(BaseModel):
    role: str


VALID_ROLES = {"designer", "writer", "approver", "admin"}


@router.patch("/members/{user_id}/role")
async def update_member_role(
    user_id: str,
    body: UpdateRoleRequest,
    user: dict = Depends(require_permission("manage_team")),
):
    if body.role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail=f"Rol inválido. Usa uno de: {VALID_ROLES}")
    updated = supabase_service.update_member_role(user["team_id"], user_id, body.role)
    return {"member": updated}

@router.post("/leave")
async def leave_team(user: dict = Depends(require_team)):
    total_members = supabase_service.count_team_members(user["team_id"])
    total_admins = supabase_service.count_team_admins(user["team_id"])

    if user["role"] == "admin" and total_admins <= 1 and total_members > 1:
        raise HTTPException(
            status_code=400,
            detail="Eres el único admin de este equipo. Asigna el rol admin a otro integrante antes de salir.",
        )

    supabase_service.leave_team(user["id"])
    return {"left": True}

@router.delete("")
async def delete_team(user: dict = Depends(require_permission("manage_team"))):
    """Elimina el equipo completo (proyectos, imágenes, comentarios, integrantes). Solo admin."""
    supabase_service.delete_team(user["team_id"])
    return {"deleted": True}
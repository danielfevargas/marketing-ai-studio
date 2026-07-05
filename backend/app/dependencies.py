from fastapi import Header, HTTPException, Depends

from app.services.supabase_service import supabase, get_user_team

ROLE_PERMISSIONS = {
    "generate_image": {"designer", "admin"},
    "edit_content": {"writer", "admin"},
    "approve_content": {"approver", "admin"},
    "comment": {"designer", "writer", "approver", "admin"},
    "manage_team": {"admin"},
}


async def get_current_user(authorization: str = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token de autenticación faltante.")

    token = authorization.replace("Bearer ", "")
    try:
        user_response = supabase.auth.get_user(token)
        user = user_response.user
        if not user:
            raise HTTPException(status_code=401, detail="Token inválido o expirado.")
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido o expirado.")

    team = get_user_team(user.id)
    return {
        "id": user.id,
        "email": user.email,
        "team_id": team["team_id"] if team else None,
        "role": team["role"] if team else None,
        "team_name": team["team_name"] if team else None,
        "invite_code": team["invite_code"] if team else None,
    }


def require_permission(action: str):
    async def checker(user: dict = Depends(get_current_user)) -> dict:
        if not user["team_id"]:
            raise HTTPException(
                status_code=403,
                detail="Necesitas crear o unirte a un equipo antes de usar esta función.",
            )
        allowed_roles = ROLE_PERMISSIONS.get(action, set())
        if user["role"] not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Tu rol ('{user['role']}') no tiene permiso para: {action}.",
            )
        return user

    return checker


async def require_team(user: dict = Depends(get_current_user)) -> dict:
    if not user["team_id"]:
        raise HTTPException(
            status_code=403,
            detail="Necesitas crear o unirte a un equipo antes de usar esta función.",
        )
    return user
"""
Autenticación y control de roles.

El frontend usa Supabase Auth para el login y manda el JWT de la sesión
en el header Authorization. Aquí lo validamos contra Supabase y
resolvemos el rol del usuario para aplicar permisos.

Roles soportados: designer, writer, approver, admin
"""

from fastapi import Header, HTTPException, Depends

from app.services.supabase_service import supabase, get_user_role

ROLE_PERMISSIONS = {
    "generate_image": {"designer", "admin"},
    "edit_content": {"writer", "admin"},
    "approve_content": {"approver", "admin"},
    "comment": {"designer", "writer", "approver", "admin"},
    "manage_users": {"admin"},
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

    role = get_user_role(user.id)
    return {"id": user.id, "email": user.email, "role": role}


def require_permission(action: str):
    """Factory de dependencia: verifica que el usuario tenga permiso para `action`."""

    async def checker(user: dict = Depends(get_current_user)) -> dict:
        allowed_roles = ROLE_PERMISSIONS.get(action, set())
        if user["role"] not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Tu rol ('{user['role']}') no tiene permiso para: {action}.",
            )
        return user

    return checker

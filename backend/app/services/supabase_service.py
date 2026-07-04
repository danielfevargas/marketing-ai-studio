"""
Cliente de Supabase para el backend.

Se usa el service_role key (NUNCA exponer en el frontend) para poder
insertar registros y subir archivos a Storage sin restricciones de RLS,
ya que el backend ya validó permisos/roles antes de llegar aquí.
"""

import uuid
from datetime import datetime, timezone

from supabase import create_client, Client

from app.config import settings

supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

IMAGES_BUCKET = "generated-images"


def upload_image(image_bytes: bytes, extension: str = "png") -> str:
    """Sube una imagen a Supabase Storage y devuelve su URL pública."""
    filename = f"{uuid.uuid4()}.{extension}"
    supabase.storage.from_(IMAGES_BUCKET).upload(
        filename, image_bytes, {"content-type": f"image/{extension}"}
    )
    return supabase.storage.from_(IMAGES_BUCKET).get_public_url(filename)


def save_image_record(user_id: str, prompt: str, style: str, image_url: str, flagged: bool) -> dict:
    """Guarda el registro de una imagen generada en la tabla `images`."""
    result = supabase.table("images").insert({
        "user_id": user_id,
        "prompt": prompt,
        "style": style,
        "image_url": image_url,
        "flagged": flagged,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }).execute()
    return result.data[0] if result.data else {}


def get_gallery(limit: int = 50) -> list:
    """Obtiene las imágenes generadas más recientes para la galería."""
    result = (
        supabase.table("images")
        .select("*")
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    return result.data


def save_content_version(project_id: str, user_id: str, content: str, operation: str) -> dict:
    """
    Guarda una nueva versión de contenido (historial/seguimiento de cambios).
    Cada edición crea una fila nueva; nunca se sobreescribe una versión anterior.
    """
    # Calcular el siguiente número de versión para este proyecto
    existing = (
        supabase.table("content_versions")
        .select("version_number")
        .eq("project_id", project_id)
        .order("version_number", desc=True)
        .limit(1)
        .execute()
    )
    next_version = (existing.data[0]["version_number"] + 1) if existing.data else 1

    result = supabase.table("content_versions").insert({
        "project_id": project_id,
        "user_id": user_id,
        "content": content,
        "operation": operation,
        "version_number": next_version,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }).execute()
    return result.data[0] if result.data else {}


def get_content_history(project_id: str) -> list:
    """Obtiene todas las versiones de contenido de un proyecto (para comparar/revertir)."""
    result = (
        supabase.table("content_versions")
        .select("*")
        .eq("project_id", project_id)
        .order("version_number", desc=True)
        .execute()
    )
    return result.data


def add_comment(project_id: str, user_id: str, text: str) -> dict:
    """Agrega un comentario a un proyecto (colaboración/retroalimentación)."""
    result = supabase.table("comments").insert({
        "project_id": project_id,
        "user_id": user_id,
        "text": text,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }).execute()
    return result.data[0] if result.data else {}


def get_comments(project_id: str) -> list:
    result = (
        supabase.table("comments")
        .select("*")
        .eq("project_id", project_id)
        .order("created_at", desc=False)
        .execute()
    )
    return result.data


def get_user_role(user_id: str) -> str:
    """Consulta el rol de un usuario (designer / writer / approver / admin)."""
    result = supabase.table("profiles").select("role").eq("id", user_id).single().execute()
    return result.data["role"] if result.data else "designer"

def list_users_with_roles() -> list:
    """
    Lista todos los usuarios registrados con su rol actual.
    Combina auth.users (para el email) con profiles (para el rol),
    usando el cliente admin de Supabase (requiere service_role key).
    """
    auth_users = supabase.auth.admin.list_users()
    profiles_result = supabase.table("profiles").select("id, role, full_name").execute()
    roles_by_id = {p["id"]: p for p in profiles_result.data}

    users = []
    for u in auth_users:
        profile = roles_by_id.get(u.id, {})
        users.append({
            "id": u.id,
            "email": u.email,
            "full_name": profile.get("full_name"),
            "role": profile.get("role", "writer"),
        })
    return users


def update_user_role(user_id: str, new_role: str) -> dict:
    """Actualiza el rol de un usuario. Solo debe llamarse tras validar permisos de admin."""
    result = supabase.table("profiles").update({"role": new_role}).eq("id", user_id).execute()
    return result.data[0] if result.data else {}

def list_projects() -> list:
    """Lista todos los proyectos, del más reciente al más antiguo."""
    result = supabase.table("projects").select("*").order("created_at", desc=True).execute()
    return result.data


def create_project(name: str, user_id: str) -> dict:
    result = supabase.table("projects").insert({
        "name": name or "Proyecto sin título",
        "created_by": user_id,
    }).execute()
    return result.data[0] if result.data else {}


def approve_image(image_id: str) -> dict:
    result = supabase.table("images").update({"status": "approved"}).eq("id", image_id).execute()
    return result.data[0] if result.data else {}


def approve_content_version(version_id: str) -> dict:
    result = supabase.table("content_versions").update({"status": "approved"}).eq("id", version_id).execute()
    return result.data[0] if result.data else {}
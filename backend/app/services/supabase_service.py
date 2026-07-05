import random
import string
import uuid
from datetime import datetime, timezone

from supabase import create_client, Client

from app.config import settings

supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

IMAGES_BUCKET = "generated-images"


def upload_image(image_bytes: bytes, extension: str = "png") -> str:
    filename = f"{uuid.uuid4()}.{extension}"
    supabase.storage.from_(IMAGES_BUCKET).upload(
        filename, image_bytes, {"content-type": f"image/{extension}"}
    )
    return supabase.storage.from_(IMAGES_BUCKET).get_public_url(filename)


def _generate_invite_code() -> str:
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=6))


def get_user_team(user_id: str):
    membership = (
        supabase.table("team_members")
        .select("team_id, role")
        .eq("user_id", user_id)
        .maybe_single()
        .execute()
    )
    if not membership or not membership.data:
        return None

    team_id = membership.data["team_id"]
    team = supabase.table("teams").select("*").eq("id", team_id).single().execute()
    return {
        "team_id": team_id,
        "role": membership.data["role"],
        "team_name": team.data["name"],
        "invite_code": team.data["invite_code"],
    }


def create_team(name: str, user_id: str) -> dict:
    invite_code = _generate_invite_code()
    team = supabase.table("teams").insert({
        "name": name or "Mi equipo",
        "invite_code": invite_code,
        "created_by": user_id,
    }).execute()
    team_id = team.data[0]["id"]

    supabase.table("team_members").insert({
        "user_id": user_id,
        "team_id": team_id,
        "role": "admin",
    }).execute()

    return get_user_team(user_id)


def join_team(invite_code: str, user_id: str) -> dict:
    team = (
        supabase.table("teams")
        .select("*")
        .eq("invite_code", invite_code.strip().upper())
        .maybe_single()
        .execute()
    )
    if not team or not team.data:
        raise ValueError("Código de invitación inválido.")

    supabase.table("team_members").insert({
        "user_id": user_id,
        "team_id": team.data["id"],
        "role": "writer",
    }).execute()

    return get_user_team(user_id)


def get_team_members(team_id: str) -> list:
    members = supabase.table("team_members").select("user_id, role").eq("team_id", team_id).execute()
    if not members.data:
        return []

    member_ids = {m["user_id"] for m in members.data}
    profiles = supabase.table("profiles").select("id, full_name").in_("id", list(member_ids)).execute()
    names_by_id = {p["id"]: p.get("full_name") for p in profiles.data}

    auth_users = supabase.auth.admin.list_users()
    emails_by_id = {u.id: u.email for u in auth_users if u.id in member_ids}

    return [
        {
            "id": m["user_id"],
            "email": emails_by_id.get(m["user_id"], "—"),
            "full_name": names_by_id.get(m["user_id"]),
            "role": m["role"],
        }
        for m in members.data
    ]


def update_member_role(team_id: str, user_id: str, new_role: str) -> dict:
    result = (
        supabase.table("team_members")
        .update({"role": new_role})
        .eq("team_id", team_id)
        .eq("user_id", user_id)
        .execute()
    )
    return result.data[0] if result.data else {}


def save_image_record(team_id: str, user_id: str, prompt: str, style: str, image_url: str, flagged: bool) -> dict:
    result = supabase.table("images").insert({
        "team_id": team_id,
        "user_id": user_id,
        "prompt": prompt,
        "style": style,
        "image_url": image_url,
        "flagged": flagged,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }).execute()
    return result.data[0] if result.data else {}


def get_gallery(team_id: str, limit: int = 50) -> list:
    result = (
        supabase.table("images")
        .select("*")
        .eq("team_id", team_id)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    return result.data


def approve_image(team_id: str, image_id: str) -> dict:
    result = (
        supabase.table("images")
        .update({"status": "approved"})
        .eq("id", image_id)
        .eq("team_id", team_id)
        .execute()
    )
    return result.data[0] if result.data else {}


def list_projects(team_id: str) -> list:
    result = (
        supabase.table("projects")
        .select("*")
        .eq("team_id", team_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


def create_project(name: str, user_id: str, team_id: str) -> dict:
    result = supabase.table("projects").insert({
        "name": name or "Proyecto sin título",
        "created_by": user_id,
        "team_id": team_id,
    }).execute()
    return result.data[0] if result.data else {}


def save_content_version(team_id: str, project_id: str, user_id: str, content: str, operation: str) -> dict:
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
        "team_id": team_id,
        "user_id": user_id,
        "content": content,
        "operation": operation,
        "version_number": next_version,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }).execute()
    return result.data[0] if result.data else {}


def get_content_history(project_id: str) -> list:
    result = (
        supabase.table("content_versions")
        .select("*")
        .eq("project_id", project_id)
        .order("version_number", desc=True)
        .execute()
    )
    return result.data


def approve_content_version(version_id: str) -> dict:
    result = supabase.table("content_versions").update({"status": "approved"}).eq("id", version_id).execute()
    return result.data[0] if result.data else {}


def get_project_team_id(project_id: str):
    result = supabase.table("projects").select("team_id").eq("id", project_id).maybe_single().execute()
    return result.data["team_id"] if result and result.data else None


def add_comment(team_id: str, project_id: str, user_id: str, text: str) -> dict:
    result = supabase.table("comments").insert({
        "project_id": project_id,
        "team_id": team_id,
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
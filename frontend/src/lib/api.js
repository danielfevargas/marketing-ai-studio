import { supabase } from "./supabaseClient";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function authHeader() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

async function handle(response) {
  const body = await response.json();
  if (!response.ok) throw new Error(body.detail || "Error inesperado");
  return body;
}

export const api = {
  async generateImage(prompt, style) {
    const res = await fetch(`${API_URL}/api/images/generate`, {
      method: "POST",
      headers: await authHeader(),
      body: JSON.stringify({ prompt, style }),
    });
    return handle(res);
  },

  async getGallery() {
    const res = await fetch(`${API_URL}/api/images/gallery`, {
      headers: await authHeader(),
    });
    return handle(res);
  },

  async editContent(projectId, text, operation) {
    const res = await fetch(`${API_URL}/api/content/edit`, {
      method: "POST",
      headers: await authHeader(),
      body: JSON.stringify({ project_id: projectId, text, operation }),
    });
    return handle(res);
  },

  async getHistory(projectId) {
    const res = await fetch(`${API_URL}/api/content/history/${projectId}`, {
      headers: await authHeader(),
    });
    return handle(res);
  },

  async revertVersion(projectId, versionId, content) {
    const res = await fetch(`${API_URL}/api/content/revert`, {
      method: "POST",
      headers: await authHeader(),
      body: JSON.stringify({ project_id: projectId, version_id: versionId, content }),
    });
    return handle(res);
  },

  async getComments(projectId) {
    const res = await fetch(`${API_URL}/api/collaboration/comments/${projectId}`, {
      headers: await authHeader(),
    });
    return handle(res);
  },

  async addComment(projectId, text) {
    const res = await fetch(`${API_URL}/api/collaboration/comments`, {
      method: "POST",
      headers: await authHeader(),
      body: JSON.stringify({ project_id: projectId, text }),
    });
    return handle(res);
  },

  async listProjects() {
    const res = await fetch(`${API_URL}/api/projects`, {
      headers: await authHeader(),
    });
    return handle(res);
  },

  async createProject(name) {
    const res = await fetch(`${API_URL}/api/projects`, {
      method: "POST",
      headers: await authHeader(),
      body: JSON.stringify({ name }),
    });
    return handle(res);
  },

  async approveImage(imageId) {
    const res = await fetch(`${API_URL}/api/images/${imageId}/approve`, {
      method: "PATCH",
      headers: await authHeader(),
    });
    return handle(res);
  },

  async approveVersion(versionId) {
    const res = await fetch(`${API_URL}/api/content/versions/${versionId}/approve`, {
      method: "PATCH",
      headers: await authHeader(),
    });
    return handle(res);
  },

  async getMyTeam() {
    const res = await fetch(`${API_URL}/api/teams/me`, {
      headers: await authHeader(),
    });
    return handle(res);
  },

  async createTeam(name) {
    const res = await fetch(`${API_URL}/api/teams/create`, {
      method: "POST",
      headers: await authHeader(),
      body: JSON.stringify({ name }),
    });
    return handle(res);
  },

  async joinTeam(inviteCode) {
    const res = await fetch(`${API_URL}/api/teams/join`, {
      method: "POST",
      headers: await authHeader(),
      body: JSON.stringify({ invite_code: inviteCode }),
    });
    return handle(res);
  },

  async getTeamMembers() {
    const res = await fetch(`${API_URL}/api/teams/members`, {
      headers: await authHeader(),
    });
    return handle(res);
  },

  async updateMemberRole(userId, role) {
    const res = await fetch(`${API_URL}/api/teams/members/${userId}/role`, {
      method: "PATCH",
      headers: await authHeader(),
      body: JSON.stringify({ role }),
    });
    return handle(res);
  },

  async leaveTeam() {
    const res = await fetch(`${API_URL}/api/teams/leave`, {
      method: "POST",
      headers: await authHeader(),
    });
    return handle(res);
  },

  async deleteTeam() {
    const res = await fetch(`${API_URL}/api/teams`, {
      method: "DELETE",
      headers: await authHeader(),
    });
    return handle(res);
  },
};
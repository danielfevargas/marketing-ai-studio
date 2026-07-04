import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../lib/AuthContext";
import Comments from "../components/Comments";

const OPERATIONS = [
  { id: "resumir", label: "Resumir" },
  { id: "expandir", label: "Expandir ideas" },
  { id: "corregir", label: "Corregir gramática y estilo" },
  { id: "variacion", label: "Generar variación" },
];

export default function ProjectWorkspace() {
  const { role } = useAuth();
  const canApprove = role === "approver" || role === "admin";

  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [creating, setCreating] = useState(false);

  const [text, setText] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const { projects } = await api.listProjects();
      setProjects(projects);
      if (projects.length > 0 && !projectId) {
        setProjectId(projects[0].id);
        loadHistory(projects[0].id);
      }
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleSelectProject(id) {
    setProjectId(id);
    setText("");
    await loadHistory(id);
  }

  async function handleCreateProject(e) {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    setCreating(true);
    try {
      const { project } = await api.createProject(newProjectName);
      setNewProjectName("");
      await loadProjects();
      setProjectId(project.id);
      setText("");
      setHistory([]);
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  }

  async function loadHistory(id) {
    try {
      const { history } = await api.getHistory(id);
      setHistory(history);
      if (history.length > 0) setText(history[0].content);
    } catch (e) {
      console.error(e);
    }
  }

  async function runOperation(operation) {
    if (!text.trim() || !projectId) return;
    setLoading(true);
    setError("");
    try {
      const { result } = await api.editContent(projectId, text, operation);
      setText(result);
      await loadHistory(projectId);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function revertTo(version) {
    setLoading(true);
    try {
      await api.revertVersion(projectId, version.id, version.content);
      setText(version.content);
      await loadHistory(projectId);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function approveVersion(version) {
    try {
      await api.approveVersion(version.id);
      await loadHistory(projectId);
    } catch (e) {
      alert(e.message);
    }
  }

  const currentProject = projects.find((p) => p.id === projectId);

  return (
    <div className="main">
      <div className="page-header">
        <p className="eyebrow">Proyecto activo</p>
        <h1 className="page-title">{currentProject?.name || "Editor de contenido"}</h1>
        <p className="page-subtitle">
          Cada proyecto tiene su propio historial. Cambia de proyecto o crea uno nuevo para
          empezar una campaña distinta sin mezclar versiones.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 24, display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div className="field" style={{ marginBottom: 0, minWidth: 220 }}>
          <label>Proyecto</label>
          <select value={projectId} onChange={(e) => handleSelectProject(e.target.value)}>
            {projects.length === 0 && <option value="">Sin proyectos todavía</option>}
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <form onSubmit={handleCreateProject} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            placeholder="Nombre del nuevo proyecto"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            style={{ padding: "10px 12px", border: "1px solid var(--line)", borderRadius: "var(--radius)" }}
          />
          <button className="btn btn-ghost btn-sm" disabled={creating}>
            + Nuevo proyecto
          </button>
        </form>
      </div>

      {!projectId ? (
        <p style={{ color: "var(--text-muted)" }}>Crea un proyecto para empezar a editar contenido.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 28 }}>
          <div>
            <div className="card">
              <div className="field">
                <label>Contenido</label>
                <textarea
                  rows={10}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Escribe el copy de tu campaña aquí..."
                />
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {OPERATIONS.map((op) => (
                  <button
                    key={op.id}
                    className="btn btn-ghost btn-sm"
                    disabled={loading}
                    onClick={() => runOperation(op.id)}
                  >
                    {op.label}
                  </button>
                ))}
              </div>

              {error && <div className="alert alert-danger" style={{ marginTop: 16 }}>{error}</div>}
            </div>

            <div className="card" style={{ marginTop: 24 }}>
              <Comments projectId={projectId} />
            </div>
          </div>

          <div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, marginBottom: 16 }}>
              Historial de versiones
            </h3>
            <div className="revision-strip">
              {history.length === 0 && (
                <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
                  Aún no hay versiones. Aplica una operación para crear la primera.
                </p>
              )}
              {history.map((v) => (
                <div className="revision-item" key={v.id}>
                  <div className="revision-meta">
                    v{v.version_number} · {v.operation}
                    {v.operation === "revertido" && <span className="revision-stamp">Revertido</span>}
                    {v.status === "approved" && <span className="revision-stamp">Aprobado</span>}
                    <div>{new Date(v.created_at).toLocaleString("es-CO")}</div>
                  </div>
                  <div className="revision-content">{v.content.slice(0, 140)}{v.content.length > 140 ? "…" : ""}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => revertTo(v)}>
                      Restaurar
                    </button>
                    {canApprove && v.status !== "approved" && (
                      <button className="btn btn-primary btn-sm" onClick={() => approveVersion(v)}>
                        Aprobar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
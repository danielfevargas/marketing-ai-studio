import { useState } from "react";
import { Sparkles, Users, KeyRound, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../lib/AuthContext";

export default function TeamOnboarding() {
  const { refreshTeam, signOut } = useAuth();
  const [mode, setMode] = useState("create");
  const [teamName, setTeamName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(e) {
    e.preventDefault();
    if (!teamName.trim()) return;
    setLoading(true);
    setError("");
    try {
      await api.createTeam(teamName);
      await refreshTeam();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(e) {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    setLoading(true);
    setError("");
    try {
      await api.joinTeam(inviteCode);
      await refreshTeam();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-brand-panel">
        <div className="sidebar-brand-mark" style={{ width: 40, height: 40 }}>
          <Sparkles size={20} strokeWidth={2.5} />
        </div>
        <h2>Un espacio de trabajo por equipo.</h2>
        <p>
          Cada equipo tiene sus propias imágenes, proyectos y miembros — completamente
          separados de otros equipos que usen Studio. Crea el tuyo o pide el código de
          invitación a quien ya tenga uno.
        </p>
      </div>

      <div className="login-form-panel">
        <div className="login-card">
          <p className="eyebrow">Studio / IA</p>
          <h1 className="page-title" style={{ fontSize: 24, marginBottom: 10 }}>
            Bienvenido
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13.5, marginBottom: 24 }}>
            Para continuar, crea un equipo nuevo o únete a uno existente.
          </p>

          <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
            <button
              className={`btn btn-sm ${mode === "create" ? "btn-primary" : "btn-ghost"}`}
              style={{ flex: 1 }}
              onClick={() => setMode("create")}
            >
              <Users size={13} /> Crear equipo
            </button>
            <button
              className={`btn btn-sm ${mode === "join" ? "btn-primary" : "btn-ghost"}`}
              style={{ flex: 1 }}
              onClick={() => setMode("join")}
            >
              <KeyRound size={13} /> Unirme
            </button>
          </div>

          {error && <div className="alert alert-danger"><AlertCircle size={16} />{error}</div>}

          {mode === "create" ? (
            <form onSubmit={handleCreate}>
              <div className="field">
                <label>Nombre del equipo</label>
                <input
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Ej: Agencia Norte, Equipo Creativo..."
                  required
                />
              </div>
              <button className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
                {loading ? <Loader2 size={15} className="spin" /> : <ArrowRight size={15} />}
                Crear equipo (serás admin)
              </button>
            </form>
          ) : (
            <form onSubmit={handleJoin}>
              <div className="field">
                <label>Código de invitación</label>
                <input
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="Ej: A1B2C3"
                  maxLength={6}
                  style={{ textTransform: "uppercase", fontFamily: "var(--font-mono)" }}
                  required
                />
              </div>
              <button className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
                {loading ? <Loader2 size={15} className="spin" /> : <ArrowRight size={15} />}
                Unirme al equipo
              </button>
            </form>
          )}

          <p style={{ marginTop: 20, fontSize: 12.5, color: "var(--text-faint)", textAlign: "center" }}>
            ¿No es tu cuenta? <a style={{ color: "var(--accent)", cursor: "pointer" }} onClick={signOut}>Cerrar sesión</a>
          </p>
        </div>
      </div>
    </div>
  );
}
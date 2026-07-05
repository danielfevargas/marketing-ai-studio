import { useEffect, useState } from "react";
import { Users, AlertCircle, ShieldCheck, Copy, Check } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../lib/AuthContext";

const ROLES = ["designer", "writer", "approver", "admin"];

const ROLE_STYLES = {
  designer: { bg: "var(--role-designer)", label: "Designer" },
  writer: { bg: "var(--role-writer)", label: "Writer" },
  approver: { bg: "var(--role-approver)", label: "Approver" },
  admin: { bg: "var(--role-admin)", label: "Admin" },
};

export default function Team() {
  const { team } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { members } = await api.getTeamMembers();
      setMembers(members);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(userId, newRole) {
    setSavingId(userId);
    try {
      await api.updateMemberRole(userId, newRole);
      setMembers((prev) => prev.map((m) => (m.id === userId ? { ...m, role: newRole } : m)));
    } catch (e) {
      alert(e.message);
    } finally {
      setSavingId(null);
    }
  }

  function copyInviteCode() {
    navigator.clipboard.writeText(team.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="main">
      <div className="page-header">
        <div>
          <p className="eyebrow"><Users size={12} /> {team?.name}</p>
          <h1 className="page-title">Equipo</h1>
          <p className="page-subtitle">
            Todas las personas con acceso a este equipo, y el rol que determina qué pueden hacer.
          </p>
        </div>
      </div>

      {team?.invite_code && (
        <div className="card" style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <p className="card-title" style={{ marginBottom: 4 }}>Código de invitación</p>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Comparte este código con tu equipo para que se unan. Entran con rol "writer" por defecto.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 700, letterSpacing: "0.1em",
              background: "var(--surface-3)", padding: "8px 16px", borderRadius: 8, color: "var(--accent)",
            }}>
              {team.invite_code}
            </span>
            <button className="btn btn-ghost btn-sm" onClick={copyInviteCode}>
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
        </div>
      )}

      {error && <div className="alert alert-danger"><AlertCircle size={16} />{error}</div>}

      {loading && (
        <div className="team-grid">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 130, borderRadius: 10 }} />)}
        </div>
      )}

      {!loading && (
        <div className="team-grid">
          {members.map((m) => {
            const roleStyle = ROLE_STYLES[m.role] || ROLE_STYLES.writer;
            const initials = (m.full_name || m.email || "??").slice(0, 2).toUpperCase();
            return (
              <div className="team-card" key={m.id}>
                <div className="team-card-avatar" style={{ background: roleStyle.bg }}>{initials}</div>
                <div className="team-card-name">{m.full_name || "Sin nombre"}</div>
                <div className="team-card-email">{m.email}</div>
                <div className="flex-between">
                  <span className="team-role-pill" style={{ background: `${roleStyle.bg}22`, color: roleStyle.bg }}>
                    <ShieldCheck size={11} /> {roleStyle.label}
                  </span>
                </div>
                <div style={{ marginTop: 12 }}>
                  <select
                    value={m.role}
                    disabled={savingId === m.id}
                    onChange={(e) => handleRoleChange(m.id, e.target.value)}
                    style={{ width: "100%", padding: "7px 10px", fontSize: 12.5 }}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
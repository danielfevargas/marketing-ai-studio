import { useEffect, useState } from "react";
import { api } from "../lib/api";

const ROLES = ["designer", "writer", "approver", "admin"];

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { users } = await api.getUsers();
      setUsers(users);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(userId, newRole) {
    setSavingId(userId);
    try {
      await api.updateUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    } catch (e) {
      alert(e.message);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="main">
      <div className="page-header">
        <p className="eyebrow">Administración</p>
        <h1 className="page-title">Usuarios y roles</h1>
        <p className="page-subtitle">
          Asigna el rol de cada persona del equipo. Solo cuentas con rol "admin" pueden ver
          esta página.
        </p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <p>Cargando…</p>}

      {!loading && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--canvas)", textAlign: "left" }}>
                <th style={{ padding: "10px 16px", fontSize: 12, textTransform: "uppercase", color: "var(--text-muted)" }}>Correo</th>
                <th style={{ padding: "10px 16px", fontSize: 12, textTransform: "uppercase", color: "var(--text-muted)" }}>Nombre</th>
                <th style={{ padding: "10px 16px", fontSize: 12, textTransform: "uppercase", color: "var(--text-muted)" }}>Rol</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderTop: "1px solid var(--line)" }}>
                  <td style={{ padding: "10px 16px", fontSize: 14 }}>{u.email}</td>
                  <td style={{ padding: "10px 16px", fontSize: 14 }}>{u.full_name || "—"}</td>
                  <td style={{ padding: "10px 16px" }}>
                    <select
                      value={u.role}
                      disabled={savingId === u.id}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      style={{ padding: "6px 10px", borderRadius: 3, border: "1px solid var(--line)" }}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
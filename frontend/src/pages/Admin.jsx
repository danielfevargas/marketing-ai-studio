import { useEffect, useState } from "react";
import { Users, AlertCircle } from "lucide-react";
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
        <div>
          <p className="eyebrow"><Users size={12} /> Administración</p>
          <h1 className="page-title">Usuarios y roles</h1>
          <p className="page-subtitle">
            Asigna el rol de cada persona del equipo. Solo cuentas con rol "admin" pueden ver
            esta página.
          </p>
        </div>
      </div>

      {error && <div className="alert alert-danger"><AlertCircle size={16} />{error}</div>}
      {loading && <div className="skeleton" style={{ height: 220 }} />}

      {!loading && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Correo</th>
                <th>Nombre</th>
                <th>Rol</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>{u.full_name || "—"}</td>
                  <td>
                    <select
                      value={u.role}
                      disabled={savingId === u.id}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      style={{ padding: "6px 10px", borderRadius: 6, border: "1.5px solid var(--line)" }}
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
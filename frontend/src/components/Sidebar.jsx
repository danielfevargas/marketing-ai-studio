import { NavLink } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

const NAV_ITEMS = [
  { to: "/generar", label: "Generar imagen", icon: "◇" },
  { to: "/galeria", label: "Galería", icon: "▦" },
  { to: "/proyecto", label: "Editor de contenido", icon: "✎" },
  { to: "/admin", label: "Usuarios y roles", icon: "⚙", adminOnly: true },
];

export default function Sidebar() {
  const { session, role, signOut } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        Studio <span>/ IA</span>
      </div>

      {NAV_ITEMS.filter((item) => !item.adminOnly || role === "admin").map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <span>{item.icon}</span> {item.label}
        </NavLink>
      ))}

      <div className="sidebar-footer">
        <div>{session?.user?.email}</div>
        <span className="role-badge">{role}</span>
        <div style={{ marginTop: 14 }}>
          <button className="btn btn-ghost btn-sm" onClick={signOut} style={{ color: "#E9E7DC", borderColor: "#3A3F5C" }}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </aside>
  );
}

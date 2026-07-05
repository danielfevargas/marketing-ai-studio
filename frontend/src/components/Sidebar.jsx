import { NavLink } from "react-router-dom";
import { LayoutDashboard, Image, LayoutGrid, PenSquare, Users, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "../lib/AuthContext";

const NAV_ITEMS = [
  { to: "/", label: "Inicio", icon: LayoutDashboard, end: true },
  { to: "/generar", label: "Generar imagen", icon: Image },
  { to: "/galeria", label: "Galería", icon: LayoutGrid },
  { to: "/proyecto", label: "Editor de contenido", icon: PenSquare },
  { to: "/admin", label: "Usuarios y roles", icon: Users, adminOnly: true },
];

export default function Sidebar() {
  const { session, role, signOut } = useAuth();
  const initials = (session?.user?.email || "??").slice(0, 2).toUpperCase();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">
          <Sparkles size={16} strokeWidth={2.5} />
        </div>
        <div className="sidebar-brand-text">
          Studio
          <span>Generación con IA</span>
        </div>
      </div>

      <div className="nav-section-label">Espacio de trabajo</div>
      {NAV_ITEMS.filter((item) => !item.adminOnly || role === "admin").map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <Icon size={17} strokeWidth={2} />
            {item.label}
          </NavLink>
        );
      })}

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-email">{session?.user?.email}</div>
            <span className="role-badge">{role}</span>
          </div>
          <button className="icon-btn-ghost" onClick={signOut} title="Cerrar sesión">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
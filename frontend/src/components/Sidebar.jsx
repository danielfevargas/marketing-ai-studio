import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Image, LayoutGrid, PenSquare, Users, LogOut,
  Sparkles, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import { useAuth } from "../lib/AuthContext";

const NAV_ITEMS = [
  { to: "/", label: "Inicio", icon: LayoutDashboard, end: true },
  { to: "/generar", label: "Generar imagen", icon: Image },
  { to: "/galeria", label: "Galería", icon: LayoutGrid },
  { to: "/proyecto", label: "Editor de contenido", icon: PenSquare },
  { to: "/equipo", label: "Equipo", icon: Users, adminOnly: true },
];

export default function Sidebar() {
  const { session, role, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("studio_sidebar_collapsed") === "1");

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("studio_sidebar_collapsed", next ? "1" : "0");
  }

  const initials = (session?.user?.email || "??").slice(0, 2).toUpperCase();

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">
            <Sparkles size={15} strokeWidth={2.5} />
          </div>
          <div className="sidebar-brand-text">
            Studio
            <span>Generación con IA</span>
          </div>
        </div>
        <button className="collapse-toggle" onClick={toggle} title={collapsed ? "Expandir" : "Colapsar"}>
          {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
        </button>
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
            title={collapsed ? item.label : undefined}
          >
            <Icon size={17} strokeWidth={2} />
            <span>{item.label}</span>
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
          {!collapsed && (
            <button className="icon-btn-ghost" onClick={signOut} title="Cerrar sesión">
              <LogOut size={15} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
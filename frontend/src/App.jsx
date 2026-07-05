import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./lib/AuthContext";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import TeamOnboarding from "./pages/TeamOnboarding";
import Dashboard from "./pages/Dashboard";
import GenerateImage from "./pages/GenerateImage";
import Gallery from "./pages/Gallery";
import ProjectWorkspace from "./pages/ProjectWorkspace";
import Team from "./pages/Team";

function ProtectedLayout({ children }) {
  const { session, team, loading } = useAuth();

  if (loading) return <div style={{ padding: 40 }}>Cargando…</div>;
  if (!session) return <Navigate to="/login" replace />;
  if (!team) return <Navigate to="/bienvenida" replace />;

  return (
    <div className="app-shell">
      <Sidebar />
      {children}
    </div>
  );
}

function OnboardingRoute() {
  const { session, team, loading } = useAuth();

  if (loading) return <div style={{ padding: 40 }}>Cargando…</div>;
  if (!session) return <Navigate to="/login" replace />;
  if (team) return <Navigate to="/" replace />;

  return <TeamOnboarding />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/bienvenida" element={<OnboardingRoute />} />
      <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
      <Route path="/generar" element={<ProtectedLayout><GenerateImage /></ProtectedLayout>} />
      <Route path="/galeria" element={<ProtectedLayout><Gallery /></ProtectedLayout>} />
      <Route path="/proyecto" element={<ProtectedLayout><ProjectWorkspace /></ProtectedLayout>} />
      <Route path="/equipo" element={<ProtectedLayout><Team /></ProtectedLayout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
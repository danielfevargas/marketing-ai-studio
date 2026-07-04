import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./lib/AuthContext";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import GenerateImage from "./pages/GenerateImage";
import Gallery from "./pages/Gallery";
import ProjectWorkspace from "./pages/ProjectWorkspace";
import Admin from "./pages/Admin";

function ProtectedLayout({ children }) {
  const { session, loading } = useAuth();

  if (loading) return <div style={{ padding: 40 }}>Cargando…</div>;
  if (!session) return <Navigate to="/login" replace />;

  return (
    <div className="app-shell">
      <Sidebar />
      {children}
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/generar"
        element={
          <ProtectedLayout>
            <GenerateImage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/galeria"
        element={
          <ProtectedLayout>
            <Gallery />
          </ProtectedLayout>
        }
      />
      <Route
        path="/proyecto"
        element={
          <ProtectedLayout>
            <ProjectWorkspace />
          </ProtectedLayout>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedLayout>
            <Admin />
          </ProtectedLayout>
        }
      />


      <Route path="*" element={<Navigate to="/generar" replace />} />
    </Routes>
  );
}

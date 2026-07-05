import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Sparkles, Image, PenSquare, Users, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../lib/AuthContext";

export default function Login() {
  const { session, signIn, signUp } = useAuth();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await signIn(email, password);
        if (error) throw error;
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        setInfo("Cuenta creada. Revisa tu correo para confirmar (o inicia sesión si la confirmación está desactivada).");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (session) return <Navigate to="/" replace />;

  return (
    <div className="login-screen">
      <div className="login-brand-panel">
        <div className="sidebar-brand-mark" style={{ width: 40, height: 40 }}>
          <Sparkles size={20} strokeWidth={2.5} />
        </div>
        <h2>Genera imágenes y contenido de campaña con IA, en equipo.</h2>
        <p>
          Una sola herramienta para diseñadores, redactores y aprobadores: generación de
          imágenes, edición de texto, historial de versiones y flujo de aprobación.
        </p>
        <div className="login-feature-list">
          <div className="login-feature">
            <Image size={18} />
            <span>Genera imágenes a partir de descripciones de texto, con distintos estilos.</span>
          </div>
          <div className="login-feature">
            <PenSquare size={18} />
            <span>Resume, expande y corrige contenido, sin perder ninguna versión anterior.</span>
          </div>
          <div className="login-feature">
            <Users size={18} />
            <span>Roles y permisos claros para todo el equipo creativo.</span>
          </div>
        </div>
      </div>

      <div className="login-form-panel">
        <div className="login-card">
          <p className="eyebrow">Studio / IA</p>
          <h1 className="page-title" style={{ fontSize: 24, marginBottom: 26 }}>
            {mode === "signin" ? "Inicia sesión" : "Crea tu cuenta"}
          </h1>

          {error && <div className="alert alert-danger"><AlertCircle size={16} />{error}</div>}
          {info && <div className="alert alert-flagged"><AlertCircle size={16} />{info}</div>}

          <form onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div className="field">
                <label>Nombre completo</label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
            )}
            <div className="field">
              <label>Correo</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="field">
              <label>Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            <button className="btn btn-primary" style={{ width: "100%", padding: "11px 18px" }} disabled={loading}>
              {loading && <Loader2 size={15} className="spin" />}
              {loading ? "Procesando..." : mode === "signin" ? "Entrar" : "Registrarme"}
            </button>
          </form>

          <p style={{ marginTop: 20, fontSize: 13, color: "var(--text-muted)" }}>
            {mode === "signin" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
            <a
              style={{ color: "var(--accent)", fontWeight: 600, cursor: "pointer" }}
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            >
              {mode === "signin" ? "Regístrate" : "Inicia sesión"}
            </a>
          </p>
          <p style={{ marginTop: 10, fontSize: 12, color: "var(--text-faint)", lineHeight: 1.5 }}>
            Nota: toda cuenta nueva se asigna por defecto al rol "writer" (puede editar
            contenido y comentar). Un administrador puede darte acceso a más funciones
            desde "Equipo" dentro de la app.
          </p>
        </div>
      </div>
    </div>
  );
}
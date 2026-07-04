import { useState } from "react";
import { Navigate } from "react-router-dom";
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

  // Ya hay sesión activa (login exitoso, o volviste con una sesión válida) -> sal de /login
  if (session) return <Navigate to="/generar" replace />;

  return (
    <div className="login-screen">
      <div className="login-card">
        <p className="eyebrow">Studio / IA</p>
        <h1 className="page-title" style={{ fontSize: 22, marginBottom: 24 }}>
          {mode === "signin" ? "Inicia sesión" : "Crea tu cuenta"}
        </h1>

        {error && <div className="alert alert-danger">{error}</div>}
        {info && <div className="alert alert-flagged">{info}</div>}

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
          <button className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Procesando..." : mode === "signin" ? "Entrar" : "Registrarme"}
          </button>
        </form>

        <p style={{ marginTop: 18, fontSize: 13, color: "var(--text-muted)" }}>
          {mode === "signin" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
          <a
            style={{ color: "var(--ochre)", fontWeight: 600, cursor: "pointer" }}
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Regístrate" : "Inicia sesión"}
          </a>
        </p>
        <p style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)" }}>
          Nota: toda cuenta nueva se asigna por defecto al rol "writer" (puede editar
          contenido y comentar). Un administrador puede darte acceso a más funciones
          (generar imágenes, aprobar contenido) desde "Usuarios y roles" dentro de la app.
        </p>
      </div>
    </div>
  );
}
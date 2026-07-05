import { useState } from "react";
import { Sparkles, AlertCircle, AlertTriangle, Download, Loader2, ImageOff } from "lucide-react";
import { api } from "../lib/api";

const STYLES = [
  { id: "ninguno", label: "Sin estilo" },
  { id: "anime", label: "Anime" },
  { id: "oleo", label: "Pintura al óleo" },
  { id: "realismo", label: "Realismo" },
  { id: "acuarela", label: "Acuarela" },
  { id: "cyberpunk", label: "Cyberpunk" },
];

export default function GenerateImage() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("ninguno");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await api.generateImage(prompt, style);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="main">
      <div className="page-header">
        <div>
          <p className="eyebrow"><Sparkles size={12} /> Generación</p>
          <h1 className="page-title">Generar imagen</h1>
          <p className="page-subtitle">
            Describe lo que necesitas con el mayor detalle posible. El estilo elegido se
            antepone automáticamente a tu descripción antes de enviarla al modelo.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Descripción de la imagen</label>
              <textarea
                rows={5}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ej: un frasco de perfume elegante sobre mármol negro, iluminación dramática, fondo minimalista"
                required
              />
            </div>

            <div className="field">
              <label>Estilo</label>
              <div className="style-picker">
                {STYLES.map((s) => (
                  <div
                    key={s.id}
                    className={`style-chip ${style === s.id ? "selected" : ""}`}
                    onClick={() => setStyle(s.id)}
                  >
                    {s.label}
                  </div>
                ))}
              </div>
            </div>

            <button className="btn btn-primary" disabled={loading} style={{ width: "100%" }}>
              {loading ? <Loader2 size={15} className="spin" /> : <Sparkles size={15} />}
              {loading ? "Generando..." : "Generar imagen"}
            </button>
          </form>

          {error && <div className="alert alert-danger" style={{ marginTop: 16 }}><AlertCircle size={16} />{error}</div>}
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          {!result && !loading && (
            <div className="empty-state" style={{ margin: "auto" }}>
              <div className="empty-state-icon"><ImageOff size={20} /></div>
              <div className="empty-state-title">Sin vista previa aún</div>
              <div className="empty-state-text">Tu imagen generada aparecerá aquí.</div>
            </div>
          )}
          {loading && (
            <div style={{ margin: "auto", textAlign: "center", color: "var(--text-muted)" }}>
              <Loader2 size={28} className="spin" style={{ marginBottom: 10 }} />
              <p style={{ fontSize: 13.5 }}>Generando imagen… puede tardar hasta 20 segundos.</p>
            </div>
          )}
          {result && (
            <div>
              {result.moderation?.flagged && (
                <div className="alert alert-flagged"><AlertTriangle size={16} />{result.moderation.reason}</div>
              )}
              <div style={{ borderRadius: "var(--radius-sm)", overflow: "hidden", border: "1px solid var(--line-soft)" }}>
                <img src={result.image.image_url} alt={prompt} style={{ width: "100%", display: "block" }} />
              </div>
              <a href={result.image.image_url} download className="btn btn-ghost btn-sm" style={{ marginTop: 14 }}>
                <Download size={14} /> Descargar imagen
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
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
        <p className="eyebrow">Generación</p>
        <h1 className="page-title">Generar imagen</h1>
        <p className="page-subtitle">
          Describe lo que necesitas con el mayor detalle posible. El estilo elegido se
          antepone automáticamente a tu descripción antes de enviarla al modelo.
        </p>
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Descripción de la imagen</label>
            <textarea
              rows={4}
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

          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Generando..." : "Generar imagen"}
          </button>
        </form>
      </div>

      {error && <div className="alert alert-danger" style={{ marginTop: 20, maxWidth: 640 }}>{error}</div>}

      {result && (
        <div style={{ marginTop: 28, maxWidth: 640 }}>
          {result.moderation?.flagged && (
            <div className="alert alert-flagged">
              {result.moderation.reason}
            </div>
          )}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <img src={result.image.image_url} alt={prompt} style={{ width: "100%", display: "block" }} />
          </div>
          <a
            href={result.image.image_url}
            download
            className="btn btn-ghost btn-sm"
            style={{ marginTop: 12 }}
          >
            Descargar imagen
          </a>
        </div>
      )}
    </div>
  );
}

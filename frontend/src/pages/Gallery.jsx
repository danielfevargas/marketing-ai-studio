import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../lib/AuthContext";

export default function Gallery() {
  const { role } = useAuth();
  const canApprove = role === "approver" || role === "admin";

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const { images } = await api.getGallery();
      setImages(images);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(imageId) {
    try {
      await api.approveImage(imageId);
      await load();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="main">
      <div className="page-header">
        <p className="eyebrow">Archivo</p>
        <h1 className="page-title">Galería</h1>
        <p className="page-subtitle">
          Todas las imágenes generadas por el equipo, ordenadas de la más reciente a la
          más antigua. Las marcadas para revisión llevan una etiqueta.
        </p>
      </div>

      {loading && <p>Cargando...</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && images.length === 0 && (
        <p style={{ color: "var(--text-muted)" }}>
          Todavía no hay imágenes generadas. Ve a "Generar imagen" para crear la primera.
        </p>
      )}

      <div className="contact-sheet">
        {images.map((img) => (
          <div className="frame" key={img.id}>
            <img src={img.image_url} alt={img.prompt} />
            {img.flagged && <span className="frame-flag">Revisar</span>}
            {img.status === "approved" && (
              <span className="frame-flag" style={{ background: "var(--teal)", right: "auto", left: 8 }}>
                Aprobado
              </span>
            )}
            <div className="frame-tag">
              {img.prompt.slice(0, 60)}{img.prompt.length > 60 ? "…" : ""}
              {canApprove && img.status !== "approved" && (
                <div style={{ marginTop: 6 }}>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ padding: "4px 10px", fontSize: 11 }}
                    onClick={() => handleApprove(img.id)}
                  >
                    Aprobar
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
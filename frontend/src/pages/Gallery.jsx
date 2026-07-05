import { useEffect, useState } from "react";
import { LayoutGrid, AlertCircle, CheckCircle2, ImageOff } from "lucide-react";
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
        <div>
          <p className="eyebrow"><LayoutGrid size={12} /> Archivo</p>
          <h1 className="page-title">Galería</h1>
          <p className="page-subtitle">
            Todas las imágenes generadas por el equipo, de la más reciente a la más antigua.
          </p>
        </div>
      </div>

      {error && <div className="alert alert-danger"><AlertCircle size={16} />{error}</div>}

      {loading && (
        <div className="contact-sheet">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton frame" />)}
        </div>
      )}

      {!loading && images.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><ImageOff size={20} /></div>
            <div className="empty-state-title">Todavía no hay imágenes</div>
            <div className="empty-state-text">Ve a "Generar imagen" para crear la primera del equipo.</div>
          </div>
        </div>
      )}

      {!loading && images.length > 0 && (
        <div className="contact-sheet">
          {images.map((img) => (
            <div className="frame" key={img.id}>
              <img src={img.image_url} alt={img.prompt} />
              {img.flagged && <span className="frame-flag">Revisar</span>}
              {img.status === "approved" && (
                <span className="frame-approved"><CheckCircle2 size={11} /> Aprobado</span>
              )}
              <div className="frame-tag">
                {img.prompt.slice(0, 60)}{img.prompt.length > 60 ? "…" : ""}
                {canApprove && img.status !== "approved" && (
                  <div style={{ marginTop: 7 }}>
                    <button
                      className="btn btn-teal btn-sm"
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
      )}
    </div>
  );
}
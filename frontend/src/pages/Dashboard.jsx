import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Image, LayoutGrid, PenSquare, FolderKanban, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../lib/AuthContext";

export default function Dashboard() {
  const { session, role } = useAuth();
  const [images, setImages] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const firstName = session?.user?.email?.split("@")[0] || "";

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const [galleryRes, projectsRes] = await Promise.all([
        api.getGallery().catch(() => ({ images: [] })),
        api.listProjects().catch(() => ({ projects: [] })),
      ]);
      setImages(galleryRes.images || []);
      setProjects(projectsRes.projects || []);
    } finally {
      setLoading(false);
    }
  }

  const approvedCount = images.filter((i) => i.status === "approved").length;

  const canGenerate = role === "designer" || role === "admin";
  const canEdit = role === "writer" || role === "admin";

  return (
    <div className="main">
      <div className="page-header">
        <div>
          <p className="eyebrow"><Sparkles size={12} /> Panel principal</p>
          <h1 className="page-title">Hola, {firstName}</h1>
          <p className="page-subtitle">
            Resumen de la actividad de tu equipo: imágenes generadas, campañas activas y
            contenido pendiente de aprobación.
          </p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <div className="stat-card-icon" style={{ background: "var(--ochre-soft)", color: "var(--ochre-deep)" }}>
              <Image size={16} />
            </div>
          </div>
          <div className="stat-card-value">{loading ? "—" : images.length}</div>
          <div className="stat-card-label">Imágenes generadas</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <div className="stat-card-icon" style={{ background: "var(--teal-soft)", color: "var(--teal-deep)" }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="stat-card-value">{loading ? "—" : approvedCount}</div>
          <div className="stat-card-label">Piezas aprobadas</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <div className="stat-card-icon" style={{ background: "rgba(20,24,43,0.06)", color: "var(--ink)" }}>
              <FolderKanban size={16} />
            </div>
          </div>
          <div className="stat-card-value">{loading ? "—" : projects.length}</div>
          <div className="stat-card-label">Proyectos activos</div>
        </div>
      </div>

      <div className="quick-actions">
        {canGenerate && (
          <Link to="/generar" className="quick-action">
            <div className="quick-action-icon"><Image size={18} /></div>
            <div>
              <div className="quick-action-title">Generar imagen</div>
              <div className="quick-action-sub">Crea una nueva pieza visual</div>
            </div>
            <ArrowRight size={16} style={{ marginLeft: "auto", color: "var(--text-faint)" }} />
          </Link>
        )}
        {canEdit && (
          <Link to="/proyecto" className="quick-action">
            <div className="quick-action-icon"><PenSquare size={18} /></div>
            <div>
              <div className="quick-action-title">Editar contenido</div>
              <div className="quick-action-sub">Continúa una campaña</div>
            </div>
            <ArrowRight size={16} style={{ marginLeft: "auto", color: "var(--text-faint)" }} />
          </Link>
        )}
        <Link to="/galeria" className="quick-action">
          <div className="quick-action-icon"><LayoutGrid size={18} /></div>
          <div>
            <div className="quick-action-title">Ver galería</div>
            <div className="quick-action-sub">Explora lo generado por el equipo</div>
          </div>
          <ArrowRight size={16} style={{ marginLeft: "auto", color: "var(--text-faint)" }} />
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24 }}>
        <div className="card">
          <div className="flex-between mt-6" style={{ marginBottom: 16 }}>
            <p className="card-title" style={{ margin: 0 }}>Imágenes recientes</p>
            <Link to="/galeria" style={{ fontSize: 12.5, color: "var(--ochre-deep)", fontWeight: 600 }}>Ver todas →</Link>
          </div>
          {loading && <div className="skeleton" style={{ height: 140 }} />}
          {!loading && images.length === 0 && (
            <div className="empty-state" style={{ padding: "32px 16px" }}>
              <div className="empty-state-icon"><Image size={20} /></div>
              <div className="empty-state-title">Sin imágenes todavía</div>
              <div className="empty-state-text">Genera la primera desde "Generar imagen".</div>
            </div>
          )}
          {!loading && images.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
              {images.slice(0, 8).map((img) => (
                <div key={img.id} style={{ aspectRatio: 1, borderRadius: 6, overflow: "hidden", background: "var(--canvas-sunken)" }}>
                  <img src={img.image_url} alt={img.prompt} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <p className="card-title" style={{ marginBottom: 16 }}>Proyectos</p>
          {loading && <div className="skeleton" style={{ height: 140 }} />}
          {!loading && projects.length === 0 && (
            <div className="empty-state" style={{ padding: "24px 12px" }}>
              <div className="empty-state-icon"><FolderKanban size={20} /></div>
              <div className="empty-state-title">Sin proyectos</div>
              <div className="empty-state-text">Crea uno desde el editor de contenido.</div>
            </div>
          )}
          {!loading && projects.slice(0, 5).map((p) => (
            <Link
              key={p.id}
              to="/proyecto"
              style={{
                display: "block", padding: "10px 0", borderBottom: "1px solid var(--line-soft)",
                fontSize: 13.5, color: "var(--text)", fontWeight: 500,
              }}
            >
              {p.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
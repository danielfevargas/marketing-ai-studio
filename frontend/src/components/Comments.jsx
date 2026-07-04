import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Comments({ projectId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (projectId) loadComments();
  }, [projectId]);

  async function loadComments() {
    try {
      const { comments } = await api.getComments(projectId);
      setComments(comments);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      await api.addComment(projectId, text);
      setText("");
      await loadComments();
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, marginBottom: 12 }}>
        Comentarios y retroalimentación
      </h3>

      {comments.length === 0 && (
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Todavía no hay comentarios en este proyecto.
        </p>
      )}

      {comments.map((c) => (
        <div className="comment" key={c.id}>
          <div className="comment-avatar">{c.user_id.slice(0, 2).toUpperCase()}</div>
          <div className="comment-body">
            <div className="comment-meta">{new Date(c.created_at).toLocaleString("es-CO")}</div>
            {c.text}
          </div>
        </div>
      ))}

      <form onSubmit={handleSubmit} style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe una nota para el equipo..."
          style={{
            flex: 1,
            padding: "10px 12px",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius)",
          }}
        />
        <button className="btn btn-primary btn-sm" disabled={loading}>
          Comentar
        </button>
      </form>
    </div>
  );
}

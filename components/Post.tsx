import type Post from "../models/post.ts";
import { JSX } from "preact";

interface PostProps {
  post: Post;
  isGrid?: boolean;
}

//  `formatDate()` maneja valores vacíos correctamente
function formatDate(date?: Date | string) {
  if (!date) return "Fecha no disponible"; // Evita errores si el campo está vacío
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(date).toLocaleDateString("es-ES", options);
}

export default function PostComponent({ post, isGrid = false }: PostProps) {
  const handleImageError = (e: JSX.TargetedEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.onerror = null;
    target.src =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='100%' height='100%' fill='%23e5e7eb'/%3E%3C/svg%3E";
  };

  //  Se verifican los datos antes de renderizar
  if (!post.title || !post._id) {
    return null; // Si el post no tiene título, no se renderiza
  }

  if (isGrid) {
    return (
      <a href={`/post/${post._id}`} className="post-card">
        <div className="post-image-container">
          {/* Se muestra un mensaje si no hay imagen */}
          {post.cover? (
            <img
              src={post.cover}
              alt={post.title || "No title"}
              onError={handleImageError}
              className="post-image"
            />
          ) : (
            <p className="no-image">Sin imagen</p>
          )}
        </div>
        <div className="post-content">
          <h2 className="post-title">{post.title}</h2>
          <p className="post-author">Por {post.author || "Desconocido"}</p>
          <div className="post-stats">
            <span className="post-likes">❤️ {post.likes || 0} Me gusta</span>
            <span className="post-comments">
              💬 {post.comments?.length || 0} Comentarios
            </span>
          </div>
          <div className="post-divider"></div>
          <p className="post-date">{formatDate(post.created_at)}</p>
        </div>
      </a>
    );
  }

  // Vista de lista
  return (
    <a href={`/post/${post._id}`} className="post-list-item">
      <div className="post-list-content">
        <h2 className="post-title">{post.title}</h2>
        <div className="post-list-meta">
          <span className="post-author">Por {post.author || "Desconocido"}</span>
          <span className="post-likes">❤️ {post.likes || 0}</span>
          <span className="post-comments">
            💬 {post.comments.length || 0}
          </span>
        </div>
      </div>
    </a>
  );
}

import { Handlers } from "$fresh/server.ts";
import axios from "axios";
import { API_BASE_URL } from "../../utils/config.ts";
import type { ApiResponseSingleSuccess } from "../../models/api_response.ts";
import type Post from "../../models/post.ts";
import PostCover from "../../islands/PostCover.tsx";
import LikeButton from "../../islands/LikeButton.tsx";

// Interfaz para los comentarios
interface Comment {
  _id: string;
  author: string;
  content: string;
  createdAt: string;
}

export const handler: Handlers = {
  async GET(_req, ctx) {
    try {
      const { data } = await axios.get<ApiResponseSingleSuccess<Post>>(
        `${API_BASE_URL}/api/posts/${ctx.params.id}`
      );
      return ctx.render({ post: data.data });
    } catch (_) {
      return ctx.render({ post: null });
    }
  },

  async POST(req, ctx) {
    const form = await req.formData();
    const action = form.get("action")?.toString();

    // 🔹 Acción para eliminar el post
    if (action === "delete") {
      try {
        await axios.delete(`${API_BASE_URL}/api/posts/${ctx.params.id}`);
        const headers = new Headers();
        headers.set("location", "/");
        return new Response(null, { status: 303, headers });
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "response" in error &&
          error.response &&
          typeof error.response === "object" &&
          "data" in error.response
        ) {
          console.error("Error deleting post:", (error.response as { data?: unknown }).data);
        } else {
          console.error("Error deleting post:", error);
        }
        return new Response("Error deleting post", { status: 500 });
      }
    }

    // 🔹 Acción para agregar un comentario
    if (action === "comment") {
      const author = form.get("author")?.toString() || "";
      const content = form.get("content")?.toString() || "";

      if (!author || !content) {
        return new Response("Required fields missing", { status: 400 });
      }

      try {
        await axios.post(
          `${API_BASE_URL}/api/posts/${ctx.params.id}/comments`,
          JSON.stringify({ author, content }), // 🔹 Se envían los datos como JSON
          { headers: { "Content-Type": "application/json" } }
        );

        const headers = new Headers();
        headers.set("location", `/post/${ctx.params.id}`);
        return new Response(null, { status: 303, headers });

      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "response" in error &&
          error.response &&
          typeof error.response === "object" &&
          "data" in error.response
        ) {
          console.error("Error posting comment:", (error.response as { data?: unknown }).data);
        } else {
          console.error("Error posting comment:", error);
        }
        return new Response("Error posting comment", { status: 500 });
      }
    }

    return new Response("Undefined action", { status: 400 });
  },
};

interface PostProps {
  data: {
    post: (Post & { comments?: Comment[] }) | null;
  };
}

export default function PostDetail({ data }: PostProps) {
  const { post } = data;

  // 🔹 Función corregida para manejar casos donde `created_at` es undefined
  const formatDate = (dateInput?: string | Date) => {
    if (!dateInput) return "Fecha no disponible";
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });
  };

  if (!post) {
    return (
      <div className="not-found-container">
        <div className="not-found-content">
          <h1>Oops! Post not found</h1>
          <p>The post you are looking for does not exist or has been deleted.</p>
          <a href="/">Back to Home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="post-detail">
      <PostCover src={post.cover} alt={`Cover image for: ${post.title}`} width={1200} height={400} />
      <div className="post-container">
        <header className="post-header">
          <h1 className="post-title">{post.title}</h1>
          <div className="post-meta">
            <span className="post-author">By {post.author}</span>
            <span className="post-date">{formatDate(post.created_at)}</span>
          </div>
        </header>
        <article className="post-content">
          <div className="post-text">{post.content.split("\n").map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
        </article>
        <footer className="post-footer">
          <div className="post-actions">
            <LikeButton postId={post._id} initialLikes={post.likes} isLiked={false} />
            <form method="post" style={{ display: "inline", marginLeft: "1rem" }}>
              <input type="hidden" name="action" value="delete" />
              <button type="submit" className="delete-button">Delete Post</button>
            </form>
          </div>
          <section className="comments-section">
            <h3>Comments ({post.comments?.length || 0})</h3>
            <form method="post" className="comment-form">
              <input type="hidden" name="action" value="comment" />
              <div className="form-group">
                <label htmlFor="author">Name:</label>
                <input type="text" id="author" name="author" required className="form-input" placeholder="Your name" />
              </div>
              <div className="form-group">
                <label htmlFor="content">Comment:</label>
                <textarea id="content" name="content" required rows={4} className="form-textarea" placeholder="Write your comment..."></textarea>
              </div>
              <button type="submit" className="submit-button">Post Comment</button>
            </form>
            <div className="comments-list-container">
              {post.comments && post.comments.length > 0 ? (
                <div className="comments-list">
                  {post.comments.map((comment: Comment) => (
                    <article key={comment._id} className="comment">
                      <header className="comment-header">
                        <strong>{comment.author}</strong>
                        <time dateTime={comment.createdAt} className="comment-date">{formatDate(comment.createdAt)}</time>
                      </header>
                      <p className="comment-content">{comment.content}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="no-comments">Be the first to comment</p>
              )}
            </div>
          </section>
        </footer>
      </div>
    </div>
  );
}

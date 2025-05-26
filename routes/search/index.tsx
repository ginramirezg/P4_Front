import { Handlers } from "$fresh/server.ts";
import PostComponent from "../../components/Post.tsx";
import Post from "../../models/post.ts";
import { API_BASE_URL } from "../../utils/config.ts";
import { ApiResponseSuccess } from "../../models/api_response.ts";
import axios from "npm:axios@1.6.2";

export const handler: Handlers = {
  async GET(_req, ctx) {
    try {
      const { url } = _req;
      const searchParams = new URL(url).searchParams;
      const title = searchParams.get("title")?.trim().toLowerCase() || ""; //Se asegura que 'title' tiene un valor válido

      if (!title) {
        return ctx.render({ posts: [], title });
      }

      const { data } = await axios.get<ApiResponseSuccess<Post[]>>(
        `${API_BASE_URL}/api/posts?title=${title}`, // Se codifica para evitar problemas en la API
      );

      console.log("Resultados obtenidos:", data.data.posts); // Debugging para verificar los resultados en consola
      return ctx.render({ posts: data.data.posts, title });
    } catch (error) {
      const { url } = _req;
      const searchParams = new URL(url).searchParams;
      const title = searchParams.get("title")?.trim().toLowerCase() || "";
      if (error instanceof axios.AxiosError) { // Verificación correcta del error
        console.error("Error en la búsqueda:", error.response?.data || error.message);
      } else {
        console.error("Error desconocido:", error);
      }
      return ctx.render({ posts: [], title });
    }
  },
};

interface SearchProps {
  data: {
    posts: Post[];
    title?: string;
  };
}

export default function Search({ data }: SearchProps) {
  const { posts, title = "" } = data;
  const hasResults = posts.length > 0;

  return (
    <div className="search-container">
      <div className="search-header">
        <h1>Buscar publicaciones</h1>

        {/* Corrección: `name="title"` y `defaultValue={title}` para mantener el término de búsqueda */}
        <form action="/search" method="get" className="search-form">
          <div className="search-input-container">
            <input
              type="text"
              name="title"
              placeholder="Buscar por título..."
              defaultValue={title}
              className="search-input"
              aria-label="Buscar publicaciones"
            />
            <button type="submit" className="search-button">Buscar</button>
          </div>
        </form>
      </div>

      {/* Se muestra correctamente el número de resultados */}
      <div className="search-results">
        {title && (
          <div className="search-info">
            <h2>
              {hasResults
                ? `Mostrando ${posts.length} resultado${posts.length !== 1 ? "s" : ""} para "${title}"`
                : `No se encontraron resultados para "${title}"`}
            </h2>
          </div>
        )}

        {hasResults ? (
          <div className="posts-list">
            {posts.map((post) => (
              <PostComponent key={post._id} post={post} isGrid={false} />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>Intenta con otros términos de búsqueda o revisa la ortografía.</p>
          </div>
        )}
      </div>
    </div>
  );
}

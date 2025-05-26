import { Handlers, PageProps } from "$fresh/server.ts";
import axios from "npm:axios";
import { API_BASE_URL } from "../utils/config.ts";
import { ApiResponseSuccess } from "../models/api_response.ts";
import Post from "../models/post.ts";

import { useSignal } from "@preact/signals";
import PostComponent from "../components/Post.tsx"; // Se importa el componente correcto
import MainView from "../islands/MainView.tsx";

export const handler: Handlers = {
  async GET(_req, ctx) {
    try {
      const { data } = await axios.get<ApiResponseSuccess<Post[]>>(
        `${API_BASE_URL}/api/posts` // Aseguramos que la API_BASE_URL sea la correcta y la ruta sea /api/posts
      );
      return ctx.render({ posts: data.data.posts });
    } catch (_) {
      return ctx.render({ posts: [] });
    }
  },
};

export default function Home(props: PageProps<{ posts: Post[] }>) {
  const isGrid = useSignal<boolean>(false); // Se inicializa aquí para que se pase como prop

  const posts = props.data.posts ?? [];

  return (
    <div>
      <h1>Últimos posts</h1>

      {/* Se pasa isGrid a la island MainViw para modificar el estado */}
      <MainView isGrid={isGrid} posts={posts} />

      {posts.length === 0 ? (
        <div className="center">
          <p>No hay posts</p>
        </div>
      ) : (
        <div className={isGrid.value ? "grid" : "list"}> {/* Para modificar la vista */}
          {posts.map((post) => (
            <PostComponent key={post._id} post={post} isGrid={isGrid.value} /> 
          ))}
        </div>
      )}
    </div>
  );
}

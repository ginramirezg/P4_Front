import { Handlers } from "$fresh/server.ts";
import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "../utils/config.ts";
import { hasValidationErrors, isApiResponseError } from "../models/api_response.ts";
import CancelButton from "./CancelButton.tsx"; // Se importa la island

interface FormDataError {
  title?: string;
  content?: string;
  author?: string;
  cover?: string;
}

// Función para validar que la clave existe
function isValidFormDataKey(key: string): key is keyof FormDataError {
  return ["title", "content", "author", "cover"].includes(key);
}

export const handler: Handlers = {
  async POST(req, ctx) {
    // Se obtienen los datos del formulario y se aseguran de ser cadenas de texto
    const form = await req.formData();
    const title = form.get("title")?.toString() || "";
    const content = form.get("content")?.toString() || "";
    const author = form.get("author")?.toString() || "";
    const cover = form.get("cover")?.toString() || "";

    try {
      // Se usa POST en lugar de PATCH para crear un nuevo post correctamente
      await axios.post(
        `${API_BASE_URL}/api/posts`,
        { title, content, author, cover },
        { headers: { "Content-Type": "application/json" } } // Se agrega encabezado para asegurar que se envía JSON
      );

      // Si se crea correctamente, se redirige a la página principal "/"
      const headers = new Headers();
      headers.set("location", "/");
      return new Response(null, { headers, status: 302 });
    } catch (error) {
      if (error instanceof AxiosError) { //Se usa `instanceof` para asegurar que es un error de Axios
        console.error("Error al crear el post:", error.response?.data);
        const body = error.response?.data;

        if (isApiResponseError(body)) {
          const errors: FormDataError = {};
          if (hasValidationErrors(body.error)) {
            body.error.details.forEach((detail) => {
              if (isValidFormDataKey(detail.path)) {
                errors[detail.path] = detail.message;
              }
            });
            return ctx.render({ errors });
          }
        }
      }

      return ctx.render({
        errors: {
          title: "There was an error creating the post.",
          content: "There was an error creating the post.",
          author: "There was an error creating the post.",
          cover: "There was an error creating the post.",
        },
      });
    }
  },
  GET(_req, ctx) {
    return ctx.render({
      errors: { title: "", content: "", author: "", cover: "" },
    });
  },
};

interface PageProps {
  data: {
    errors?: FormDataError;
  };
}

export default function Create({ data }: PageProps) {
  const { errors = {} } = data || {};

  return (
    <div className="create-post-container">
      <h1 className="create-post-title">Create New Post</h1>

      {/* Se asegura que los inputs envían el formato correcto a la API */}
      <form className="post-form" action="/create" method="POST">
        <div className="form-group">
          <label htmlFor="title" className="form-label">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            className={errors?.title ? "form-input input-error" : "form-input"}
            placeholder="Enter an attractive title"
            required
          />
          {errors?.title && <p className="error-message">{errors.title}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="content" className="form-label">Content</label>
          <textarea
            id="content"
            name="content"
            className={errors?.content ? "form-textarea input-error" : "form-textarea"}
            rows={8}
            placeholder="Write your post content here..."
            required
          ></textarea>
          {errors?.content && <p className="error-message">{errors.content}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="author" className="form-label">Author</label>
          <input
            type="text"
            id="author"
            name="author"
            className={errors?.author ? "form-input input-error" : "form-input"}
            required
          />
          {errors?.author && <p className="error-message">{errors.author}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="cover" className="form-label">Cover Image URL</label>
          <input
            type="url"
            id="cover"
            name="cover"
            className={errors?.cover ? "form-input input-error" : "form-input"}
            placeholder="https://example.com/image.jpg"
          />
          {errors?.cover && <p className="error-message">{errors.cover}</p>}
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button">Publish Post</button>
          <CancelButton data={{ errors: {} }} /> {/*Se usa la island en lugar del botón original */}
        </div>
      </form>
    </div>
  );
}

import Comment from "./comments.ts";

//Cambiados los nombres de los atributos para que coincidan con los datos que se reciben de la API
interface Post {
  _id: string;
  title: string;
  content: string;
  author: string;
  cover: string;
  likes: number;
  created_at: Date; 
  updated_at: Date;
  comments: Comment[];
}

export default Post;

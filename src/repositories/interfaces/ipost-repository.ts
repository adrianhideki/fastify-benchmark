import { InPost } from "../../models/post/in-post";
import { OutPost } from "../../models/post/out-post";

export interface IPostRepository {
  createPost: (post: InPost) => Promise<OutPost>;
  getPosts: () => Promise<Array<OutPost>>;
}

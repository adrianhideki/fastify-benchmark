import { InPost } from "../../models/post/in-post";
import { OutPost } from "../../models/post/out-post";

export interface IPostService {
  getPosts: () => Promise<Array<OutPost>>;
  createPost: (post: InPost) => Promise<OutPost>;
}

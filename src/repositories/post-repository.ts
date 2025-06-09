import { InPost } from "../models/post/in-post";
import { OutPost } from "../models/post/out-post";
import { BaseRepository } from "./base-repository";
import { IPostRepository } from "./interfaces/ipost-repository";

export class PostRepository extends BaseRepository implements IPostRepository {
  public async getPosts(): Promise<OutPost[]> {
    const result = await this.client.post.findMany({
      include: {
        author: true,
      },
    });

    return result;
  }

  public async createPost(data: InPost): Promise<OutPost> {
    const result = await this.client.post.create({ data });

    return result;
  }
}

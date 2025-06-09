import { InPost } from "../models/post/in-post";
import { IPostRepository } from "../repositories/interfaces/ipost-repository";
import { IUserRepository } from "../repositories/interfaces/iuser-repository";
import { IPostService } from "./interfaces/ipost-service";

export class PostService implements IPostService {
  public constructor(
    private repository: IPostRepository,
    private userRepository: IUserRepository
  ) {}

  public async getPosts() {
    return await this.repository.getPosts();
  }

  public async createPost(data: InPost) {
    if (!await this.userRepository.getById(data.authorId)) {
      throw "Invalid author";
    }

    return await this.repository.createPost(data);
  }
}

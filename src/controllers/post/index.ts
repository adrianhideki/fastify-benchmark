import { FastifyReply, FastifyRequest } from "fastify";
import { createPostSchema } from "./schema";
import { IPostService } from "../../services/interfaces/ipost-service";

export class PostController {
  public constructor(private service: IPostService) {
    this.service = service;
  }

  public async createPost(request: FastifyRequest, reply: FastifyReply) {
    const data = await createPostSchema.safeParseAsync(request.body);

    if (!data.success) {
      throw data.error;
    }

    const result = await this.service.createPost(data.data);
    reply.code(201).send(result);
  }

  public async getPosts(_: FastifyRequest, reply: FastifyReply) {
    const result = await this.service.getPosts();

    reply.code(200).send(result);
  }
}

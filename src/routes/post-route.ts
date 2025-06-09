import { FastifyInstance } from "fastify";
import { PostController } from "../controllers/post";
import { PostService } from "../services/post-service";
import { PostRepository } from "../repositories/post-repository";
import { IRoute } from "./interfaces/iroute";
import { UserRepository } from "../repositories/user-repository";

export class PostRoute implements IRoute {
  public registerRoutes(server: FastifyInstance) {
    server.get("/posts", async (req, reply) => {
      const controller = new PostController(
        new PostService(new PostRepository(), new UserRepository())
      );

      return controller.getPosts(req, reply);
    });

    server.post("/posts", async (req, reply) => {
      const controller = new PostController(
        new PostService(new PostRepository(), new UserRepository())
      );

      return controller.createPost(req, reply);
    });
  }
}

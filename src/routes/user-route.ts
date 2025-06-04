import { FastifyInstance } from "fastify";
import { UserController } from "../controllers/user";
import { UserService } from "../services/user-service";
import { UserRepository } from "../repositories/user-repository";
import { IRoute } from "./interfaces/iroute";

export class UserRoute implements IRoute {
  public registerRoutes(server: FastifyInstance) {
    server.get("/users", async (req, reply) => {
      const controller = new UserController(
        new UserService(new UserRepository())
      );

      return controller.getUsers(req, reply);
    });

    server.post("/users", async (req, reply) => {
      const controller = new UserController(
        new UserService(new UserRepository())
      );

      return controller.createUser(req, reply);
    });
  }
}

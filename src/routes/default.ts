import { FastifyInstance } from "fastify";
import { IRoute } from "./interfaces/iroute";

export class Default implements IRoute {
  public registerRoutes(server: FastifyInstance) {
    server.get("/", async (_, reply) => {
      reply.statusCode = 200;
      return "ok";
    });
  }
}

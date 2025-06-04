import { FastifyInstance } from "fastify";

export interface IRoute {
  registerRoutes: (server: FastifyInstance) => void;
}

import fastify from "fastify";
import routes from "./routes";

const server = fastify();

routes.forEach((r) => r.registerRoutes(server));

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});

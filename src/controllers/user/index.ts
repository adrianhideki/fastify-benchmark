import { FastifyReply, FastifyRequest } from "fastify";
import { createUserSchema } from "./schema";
import { IUserService } from "../../services/interfaces/iuser-service";

export class UserController {
  public constructor(private service: IUserService) {
    this.service = service;
  }

  public async createUser(request: FastifyRequest, reply: FastifyReply) {
    const data = await createUserSchema.safeParseAsync(request.body);

    if (!data.success) {
      throw data.error;
    }

    const result = await this.service.createUser(data.data);
    reply.code(201).send(result);
  }

  public async getUsers(_: FastifyRequest, reply: FastifyReply) {
    const result = await this.service.getUsers();

    reply.code(200).send(result);
  }
}

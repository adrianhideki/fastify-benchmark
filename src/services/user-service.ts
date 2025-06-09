import { InUser } from "../models/user/in-user";
import { IUserRepository } from "../repositories/interfaces/iuser-repository";
import { IUserService } from "./interfaces/iuser-service";

export class UserService implements IUserService {
  public constructor(private repository: IUserRepository) {}

  public async getUsers() {
    return await this.repository.getUsers();
  }

  public async createUser(data: InUser) {
    return await this.repository.createUser(data);
  }
}

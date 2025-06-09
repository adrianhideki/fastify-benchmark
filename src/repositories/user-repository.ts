import { InUser } from "../models/user/in-user";
import { OutUser } from "../models/user/out-user";
import { BaseRepository } from "./base-repository";
import { IUserRepository } from "./interfaces/iuser-repository";

export class UserRepository extends BaseRepository implements IUserRepository {
  public async getUsers(): Promise<OutUser[]> {
    const result = await this.client.user.findMany();

    return result;
  }

  public async getById(id: number): Promise<OutUser | null> {
    const result = await this.client.user.findFirst({
      where: {
        id: id,
      },
    });

    return result;
  }

  public async createUser(data: InUser): Promise<OutUser> {
    const result = await this.client.user.create({ data });

    return result;
  }
}

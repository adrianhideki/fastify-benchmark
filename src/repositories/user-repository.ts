import { InUser } from "../models/in-user";
import { OutUser } from "../models/out-user";
import { BaseRepository } from "./base-repository";

export class UserRepository extends BaseRepository {
  public async getUsers(): Promise<OutUser[]> {
    const result = await this.client.user.findMany();

    return result;
  }

  public async createUser(data: InUser): Promise<OutUser> {
    const result = await this.client.user.create({ data });

    return result;
  }
}

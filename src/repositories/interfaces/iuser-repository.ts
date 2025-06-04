import { InUser } from "../../core/models/in-user";
import { OutUser } from "../../core/models/out-user";

export interface IUserRepository {
  createUser: (user: InUser) => Promise<OutUser>;
  getUsers: () => Promise<Array<OutUser>>;
}

import { InUser } from "../../models/in-user";
import { OutUser } from "../../models/out-user";

export interface IUserRepository {
  createUser: (user: InUser) => Promise<OutUser>;
  getUsers: () => Promise<Array<OutUser>>;
}

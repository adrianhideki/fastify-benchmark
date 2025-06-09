import { InUser } from "../../models/user/in-user";
import { OutUser } from "../../models/user/out-user";

export interface IUserRepository {
  createUser: (user: InUser) => Promise<OutUser>;
  getUsers: () => Promise<Array<OutUser>>;
  getById: (id: number) => Promise<OutUser | null>;
}

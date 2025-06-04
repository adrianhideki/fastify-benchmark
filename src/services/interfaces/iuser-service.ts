import { InUser } from "../../models/in-user";
import { OutUser } from "../../models/out-user";

export interface IUserService {
  getUsers: () => Promise<Array<OutUser>>;
  createUser: (user: InUser) => Promise<OutUser>;
}

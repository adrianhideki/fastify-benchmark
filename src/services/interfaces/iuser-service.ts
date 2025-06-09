import { InUser } from "../../models/user/in-user";
import { OutUser } from "../../models/user/out-user";

export interface IUserService {
  getUsers: () => Promise<Array<OutUser>>;
  createUser: (user: InUser) => Promise<OutUser>;
}

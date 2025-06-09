import { OutUser } from "../user/out-user";

export interface OutPost {
  id: number;
  title: string | null;
  content: string | null;
  published: boolean;
  authorId: number | null;
  author?: OutUser | null;
}

import { DbClient } from "../infrastructure/prisma-client";

export class BaseRepository {
  protected client = DbClient.getInstance().getClient();
}

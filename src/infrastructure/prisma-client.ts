import { PrismaClient } from "@prisma/client";

export class DbClient {
  private static instance: DbClient;
  private client: PrismaClient;

  private constructor() {
    this.client = new PrismaClient();
  }

  public static getInstance(): DbClient {
    if (!DbClient.instance) {
      DbClient.instance = new DbClient();
    }
    return DbClient.instance;
  }

  public getClient() {
    return this.client;
  }
}

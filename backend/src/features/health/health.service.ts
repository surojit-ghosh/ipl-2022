import { database } from "@/lib/db";

export async function isDatabaseReady() {
  await database().$queryRaw`SELECT 1`;
}

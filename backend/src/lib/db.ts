import { prisma } from "@/db/prisma";

export function database() {
  if (!prisma) throw new Error("DATABASE_URL is required");
  return prisma;
}

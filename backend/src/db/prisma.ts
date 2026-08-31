import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@/config/env";

export const prisma = env.DATABASE_URL
  ? new PrismaClient({
      adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
    })
  : null;

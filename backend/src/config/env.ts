import { z } from "zod";

const schema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().optional(),
});

export const env = schema.parse(process.env);

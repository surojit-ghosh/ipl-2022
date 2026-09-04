import { z } from "zod";

import { positiveIdSchema } from "@/lib/validation";
import { scopeSchema } from "@/lib/scope";

export const teamIdParamsSchema = z.object({ id: positiveIdSchema }).strict();
export const teamStatsQuerySchema = z.object({ scope: scopeSchema }).strict();

const teamSchema = z
  .object({
    id: z.number().int().positive(),
    name: z.string(),
  })
  .passthrough();

export const teamListResponseSchema = z.object({ data: z.array(teamSchema) });
export const teamResponseSchema = teamSchema;

export const teamStatsResponseSchema = z.object({
  teamId: z.number().int().positive(),
  scope: scopeSchema,
  matches: z.number().int().nonnegative(),
  wins: z.number().int().nonnegative(),
  losses: z.number().int().nonnegative(),
  snapshots: z.array(z.unknown()),
});

import { z } from "zod";

import { paginationMetaSchema } from "@/lib/response";
import { scopeSchema } from "@/lib/scope";
import { optionalTextSchema, paginationQuerySchema, positiveIdSchema } from "@/lib/validation";

export const playerIdParamsSchema = z.object({ id: positiveIdSchema }).strict();
export const playersQuerySchema = paginationQuerySchema.extend({ q: optionalTextSchema });
export const playerStatsQuerySchema = z.object({ scope: scopeSchema }).strict();

const playerSchema = z
  .object({
    id: z.number().int().positive(),
    name: z.string(),
  })
  .passthrough();

export const playerListResponseSchema = z.object({
  data: z.array(playerSchema),
  meta: paginationMetaSchema,
});

export const playerResponseSchema = playerSchema;

export const playerStatsResponseSchema = z.object({
  playerId: z.number().int().positive(),
  scope: scopeSchema,
  batting: z.object({
    innings: z.number().int().nonnegative(),
    runs: z.number().nonnegative(),
    balls: z.number().nonnegative(),
    fours: z.number().nonnegative(),
    sixes: z.number().nonnegative(),
    average: z.number().nullable(),
    strikeRate: z.number().nullable(),
  }),
  bowling: z.object({
    innings: z.number().int().nonnegative(),
    wickets: z.number().nonnegative(),
    runsConceded: z.number().nonnegative(),
    maidens: z.number().nonnegative(),
    economy: z.number().nullable(),
  }),
});

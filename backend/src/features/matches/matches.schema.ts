import { z } from "zod";

import {
  optionalNonNegativeIntSchema,
  optionalPositiveIntSchema,
  optionalTextSchema,
  paginationQuerySchema,
  positiveIdSchema,
} from "@/lib/validation";
import { paginationMetaSchema } from "@/lib/response";

export const matchIdParamsSchema = z.object({ id: positiveIdSchema }).strict();

export const matchesQuerySchema = paginationQuerySchema.extend({
  team_id: optionalPositiveIntSchema,
  venue_id: optionalPositiveIntSchema,
  stage: z.enum(["league", "playoffs"]).optional(),
  order: z.enum(["asc", "desc"]).default("asc"),
});

export const wagonWheelQuerySchema = z.object({
  inning: optionalPositiveIntSchema,
  batter_id: optionalPositiveIntSchema,
  bat_runs: optionalNonNegativeIntSchema,
  zone: optionalTextSchema,
}).strict();

const matchSchema = z
  .object({
    id: z.number().int().positive(),
    title: z.string(),
  })
  .passthrough();

export const matchListResponseSchema = z.object({
  data: z.array(matchSchema),
  meta: paginationMetaSchema,
});
export const matchResponseSchema = matchSchema;

export const scorecardResponseSchema = z.object({
  matchId: z.number().int().positive(),
  innings: z.array(z.unknown()),
});

export const commentaryResponseSchema = z.object({
  matchId: z.number().int().positive(),
  data: z.array(z.unknown()),
});

export const wagonWheelResponseSchema = z.object({
  matchId: z.number().int().positive(),
  historical: z.literal(true),
  data: z.array(z.unknown()),
});

export const historicalSnapshotResponseSchema = z
  .object({
    matchId: z.number().int().positive(),
    historical: z.literal(true),
  })
  .passthrough();

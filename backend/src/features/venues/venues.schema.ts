import { z } from "zod";

import { positiveIdSchema } from "@/lib/validation";

export const venueIdParamsSchema = z.object({ id: positiveIdSchema }).strict();

const venueSchema = z
  .object({
    id: z.number().int().positive(),
    name: z.string(),
  })
  .passthrough();

export const venueListResponseSchema = z.object({ data: z.array(venueSchema) });
export const venueResponseSchema = venueSchema;

export const venueStatsResponseSchema = z.object({
  venueId: z.number().int().positive(),
  matches: z.number().int().nonnegative(),
  averageFirstInningsScore: z.number().nullable(),
  highestFirstInningsScore: z.number().nullable(),
  lowestFirstInningsScore: z.number().nullable(),
});

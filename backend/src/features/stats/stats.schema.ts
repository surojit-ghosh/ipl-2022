import { z } from "zod";

import { scopeSchema } from "@/lib/scope";

import { BATTING_CATEGORIES, BOWLING_CATEGORIES } from "./stats.constants";

export const battingStatsQuerySchema = z
  .object({
    scope: scopeSchema,
    category: z.enum(BATTING_CATEGORIES).default("batting_most_runs"),
  })
  .strict();

export const bowlingStatsQuerySchema = z
  .object({
    scope: scopeSchema,
    category: z.enum(BOWLING_CATEGORIES).default("bowling_top_wicket_takers"),
  })
  .strict();

export const scopedStatsQuerySchema = z.object({ scope: scopeSchema }).strict();

export const leaderboardResponseSchema = z.object({
  scope: scopeSchema,
  category: z.string(),
  data: z.array(z.unknown()),
});

export const collectionStatsResponseSchema = z.object({
  scope: scopeSchema,
  data: z.array(z.unknown()),
});

export const teamStatsResponseSchema = z.object({ data: z.array(z.unknown()) });

export const summaryResponseSchema = z.object({
  matches: z.number().int().nonnegative(),
  teams: z.number().int().nonnegative(),
  players: z.number().int().nonnegative(),
  topBatters: z.array(z.unknown()),
  topBowlers: z.array(z.unknown()),
});

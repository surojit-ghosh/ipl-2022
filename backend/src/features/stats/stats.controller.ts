import type { RequestHandler } from "express";

import { send } from "@/lib/response";
import { parseRequest } from "@/lib/validation";

import {
  battingStatsQuerySchema,
  bowlingStatsQuerySchema,
  collectionStatsResponseSchema,
  leaderboardResponseSchema,
  scopedStatsQuerySchema,
  summaryResponseSchema,
  teamStatsResponseSchema,
} from "./stats.schema";
import {
  battingStats,
  bowlingStats,
  statsSummary,
  teamStats,
  venueStats,
} from "./stats.service";

export const getBattingStats: RequestHandler = async (req, res) => {
  const query = parseRequest(battingStatsQuerySchema, req.query);
  send(res, leaderboardResponseSchema, {
    scope: query.scope,
    category: query.category,
    data: await battingStats(query.scope, query.category),
  });
};

export const getBowlingStats: RequestHandler = async (req, res) => {
  const query = parseRequest(bowlingStatsQuerySchema, req.query);
  send(res, leaderboardResponseSchema, {
    scope: query.scope,
    category: query.category,
    data: await bowlingStats(query.scope, query.category),
  });
};

export const getTeamStats: RequestHandler = async (req, res) => {
  const { scope } = parseRequest(scopedStatsQuerySchema, req.query);
  send(res, teamStatsResponseSchema, { data: await teamStats(scope) });
};

export const getStatsSummary: RequestHandler = async (_req, res) => {
  send(res, summaryResponseSchema, await statsSummary());
};

export const getVenueStats: RequestHandler = async (req, res) => {
  const { scope } = parseRequest(scopedStatsQuerySchema, req.query);
  send(res, collectionStatsResponseSchema, { scope, data: await venueStats(scope) });
};

import type { RequestHandler } from "express";

import { NotFoundError } from "@/lib/api-error";
import { send } from "@/lib/response";
import { parseRequest } from "@/lib/validation";

import {
  commentaryResponseSchema,
  historicalSnapshotResponseSchema,
  matchIdParamsSchema,
  matchListResponseSchema,
  matchResponseSchema,
  matchesQuerySchema,
  scorecardResponseSchema,
  wagonWheelQuerySchema,
  wagonWheelResponseSchema,
} from "./matches.schema";
import {
  latestMatch,
  listMatches,
  matchCommentary,
  matchDetail,
  matchExists,
  matchHistoricalSnapshot,
  matchWagonWheel,
} from "./matches.service";

function requireResource<T>(resource: string, value: T | null): T {
  if (!value) throw new NotFoundError(resource);
  return value;
}

export const getLatestMatch: RequestHandler = async (_req, res) => {
  send(res, matchResponseSchema, requireResource("Match", await latestMatch()));
};

export const getMatches: RequestHandler = async (req, res) => {
  const query = parseRequest(matchesQuerySchema, req.query);
  const result = await listMatches({
    page: query.page,
    pageSize: query.page_size,
    teamId: query.team_id,
    venueId: query.venue_id,
    stage: query.stage,
    order: query.order,
  });
  send(res, matchListResponseSchema, result);
};

export const getMatch: RequestHandler = async (req, res) => {
  const { id } = parseRequest(matchIdParamsSchema, req.params);
  send(res, matchResponseSchema, requireResource("Match", await matchDetail(id)));
};

export const getScorecard: RequestHandler = async (req, res) => {
  const { id } = parseRequest(matchIdParamsSchema, req.params);
  const match = requireResource("Match", await matchDetail(id));
  send(res, scorecardResponseSchema, { matchId: match.id, innings: match.innings });
};

export const getCommentary: RequestHandler = async (req, res) => {
  const { id } = parseRequest(matchIdParamsSchema, req.params);
  if (!(await matchExists(id))) throw new NotFoundError("Match");
  send(res, commentaryResponseSchema, { matchId: id, data: await matchCommentary(id) });
};

export const getWagonWheel: RequestHandler = async (req, res) => {
  const { id } = parseRequest(matchIdParamsSchema, req.params);
  const query = parseRequest(wagonWheelQuerySchema, req.query);
  if (!(await matchExists(id))) throw new NotFoundError("Match");
  const data = await matchWagonWheel(id, {
    inning: query.inning,
    batterId: query.batter_id,
    batRuns: query.bat_runs,
    zone: query.zone,
  });
  send(res, wagonWheelResponseSchema, { matchId: id, historical: true, data });
};

export const getHistoricalSnapshot: RequestHandler = async (req, res) => {
  const { id } = parseRequest(matchIdParamsSchema, req.params);
  if (!(await matchExists(id))) throw new NotFoundError("Match");
  const snapshot = requireResource("Historical snapshot", await matchHistoricalSnapshot(id));
  send(res, historicalSnapshotResponseSchema, { matchId: id, historical: true, ...snapshot });
};

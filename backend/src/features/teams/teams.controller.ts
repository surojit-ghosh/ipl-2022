import type { RequestHandler } from "express";

import { NotFoundError } from "@/lib/api-error";
import { send } from "@/lib/response";
import { parseRequest } from "@/lib/validation";

import {
  teamIdParamsSchema,
  teamListResponseSchema,
  teamResponseSchema,
  teamStatsQuerySchema,
  teamStatsResponseSchema,
} from "./teams.schema";
import { findTeam, listTeams, teamExists, teamStats } from "./teams.service";

export const getTeams: RequestHandler = async (_req, res) => {
  send(res, teamListResponseSchema, { data: await listTeams() });
};

export const getTeam: RequestHandler = async (req, res) => {
  const { id } = parseRequest(teamIdParamsSchema, req.params);
  const team = await findTeam(id);
  if (!team) throw new NotFoundError("Team");
  send(res, teamResponseSchema, team);
};

export const getTeamStats: RequestHandler = async (req, res) => {
  const { id } = parseRequest(teamIdParamsSchema, req.params);
  const { scope } = parseRequest(teamStatsQuerySchema, req.query);
  if (!(await teamExists(id))) throw new NotFoundError("Team");
  send(res, teamStatsResponseSchema, await teamStats(id, scope));
};

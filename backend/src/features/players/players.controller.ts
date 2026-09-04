import type { RequestHandler } from "express";

import { NotFoundError } from "@/lib/api-error";
import { send } from "@/lib/response";
import { parseRequest } from "@/lib/validation";

import {
  playerIdParamsSchema,
  playerListResponseSchema,
  playerResponseSchema,
  playersQuerySchema,
  playerStatsQuerySchema,
  playerStatsResponseSchema,
} from "./players.schema";
import { findPlayer, listPlayers, playerExists, playerSeasonStats } from "./players.service";

export const getPlayers: RequestHandler = async (req, res) => {
  const query = parseRequest(playersQuerySchema, req.query);
  const players = await listPlayers({
    page: query.page,
    pageSize: query.page_size,
    query: query.q,
  });
  send(res, playerListResponseSchema, players);
};

export const getPlayer: RequestHandler = async (req, res) => {
  const { id } = parseRequest(playerIdParamsSchema, req.params);
  const player = await findPlayer(id);
  if (!player) throw new NotFoundError("Player");
  send(res, playerResponseSchema, player);
};

export const getPlayerSeasonStats: RequestHandler = async (req, res) => {
  const { id } = parseRequest(playerIdParamsSchema, req.params);
  const { scope } = parseRequest(playerStatsQuerySchema, req.query);
  if (!(await playerExists(id))) throw new NotFoundError("Player");
  send(res, playerStatsResponseSchema, await playerSeasonStats(id, scope));
};

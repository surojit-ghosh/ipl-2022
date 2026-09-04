import { Router } from "express";

import { getPlayer, getPlayers, getPlayerSeasonStats } from "./players.controller";

export const playersRouter = Router();

playersRouter.get("/", getPlayers);
playersRouter.get("/:id/season-stats", getPlayerSeasonStats);
playersRouter.get("/:id", getPlayer);

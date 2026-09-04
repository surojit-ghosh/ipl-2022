import { Router } from "express";

import {
  getCommentary,
  getHistoricalSnapshot,
  getLatestMatch,
  getMatch,
  getMatches,
  getScorecard,
  getWagonWheel,
} from "./matches.controller";

export const matchesRouter = Router();

matchesRouter.get("/latest", getLatestMatch);
matchesRouter.get("/", getMatches);
matchesRouter.get("/:id/scorecard", getScorecard);
matchesRouter.get("/:id/commentary", getCommentary);
matchesRouter.get("/:id/wagon-wheel", getWagonWheel);
matchesRouter.get("/:id/historical-snapshot", getHistoricalSnapshot);
matchesRouter.get("/:id", getMatch);

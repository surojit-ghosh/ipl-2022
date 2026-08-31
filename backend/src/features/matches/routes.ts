import { Router } from "express";

import {
  numberQuery,
  orderQuery,
  pagedQuery,
  pathId,
  stringQuery,
} from "@/lib/query";

import {
  latestMatch,
  listMatches,
  matchCommentary,
  matchDetail,
  matchExists,
  matchHistoricalSnapshot,
  matchWagonWheel,
} from "./service";

export const matchesRouter = Router();

matchesRouter.get("/latest", async (_req, res, next) => {
  try {
    const match = await latestMatch();
    if (!match) return res.status(404).json({ error: "Match not found" });
    res.json(match);
  } catch (error) {
    next(error);
  }
});

matchesRouter.get("/", async (req, res, next) => {
  try {
    const { page, pageSize } = pagedQuery(req.query);
    const result = await listMatches({
      page,
      pageSize,
      teamId: numberQuery(req.query.team_id, "team_id", { min: 1 }),
      venueId: numberQuery(req.query.venue_id, "venue_id", { min: 1 }),
      order: orderQuery(req.query.order),
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

matchesRouter.get("/:id", async (req, res, next) => {
  try {
    const id = pathId(req.params.id);
    if (id === null) return res.status(400).json({ error: "Invalid match id" });
    const match = await matchDetail(id);
    if (!match) return res.status(404).json({ error: "Match not found" });
    res.json(match);
  } catch (error) {
    next(error);
  }
});

matchesRouter.get("/:id/scorecard", async (req, res, next) => {
  try {
    const id = pathId(req.params.id);
    if (id === null) return res.status(400).json({ error: "Invalid match id" });
    const match = await matchDetail(id);
    if (!match) return res.status(404).json({ error: "Match not found" });
    res.json({ matchId: match.id, innings: match.innings });
  } catch (error) {
    next(error);
  }
});

matchesRouter.get("/:id/commentary", async (req, res, next) => {
  try {
    const id = pathId(req.params.id);
    if (id === null) return res.status(400).json({ error: "Invalid match id" });
    const commentary = await matchCommentary(id);
    res.json({ matchId: id, data: commentary });
  } catch (error) {
    next(error);
  }
});

matchesRouter.get("/:id/wagon-wheel", async (req, res, next) => {
  try {
    const id = pathId(req.params.id);
    if (id === null) return res.status(400).json({ error: "Invalid match id" });
    const match = await matchExists(id);
    if (!match) return res.status(404).json({ error: "Match not found" });
    const inning = numberQuery(req.query.inning, "inning", { min: 1 });
    const batterId = numberQuery(req.query.batter_id, "batter_id", { min: 1 });
    const batRuns = numberQuery(req.query.bat_runs, "bat_runs", { min: 0 });
    const zone = stringQuery(req.query.zone, "zone");
    const data = await matchWagonWheel(id, { inning, batterId, batRuns, zone });
    res.json({ matchId: id, historical: true, data });
  } catch (error) {
    next(error);
  }
});

matchesRouter.get("/:id/historical-snapshot", async (req, res, next) => {
  try {
    const id = pathId(req.params.id);
    if (id === null) return res.status(400).json({ error: "Invalid match id" });
    const match = await matchExists(id);
    if (!match) return res.status(404).json({ error: "Match not found" });
    const snapshot = await matchHistoricalSnapshot(id);
    if (!snapshot) return res.status(404).json({ error: "Historical snapshot not found" });
    res.json({ matchId: id, historical: true, ...snapshot });
  } catch (error) {
    next(error);
  }
});

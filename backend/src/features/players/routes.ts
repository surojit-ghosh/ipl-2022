import { Router } from "express";

import { database } from "@/lib/db";
import { pagedQuery, pathId } from "@/lib/query";
import { matchesScope, oversToBalls, queryScope } from "@/lib/scope";

export const playersRouter = Router();

playersRouter.get("/", async (req, res, next) => {
  try {
    const { page, pageSize } = pagedQuery(req.query);
    const q = typeof req.query.q === "string" ? req.query.q : undefined;
    const where = q?.trim()
      ? { name: { contains: q.trim(), mode: "insensitive" as const } }
      : undefined;
    const db = database();
    const [players, total] = await Promise.all([
      db.player.findMany({
        where,
        orderBy: { name: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.player.count({ where }),
    ]);
    res.json({
      data: players,
      meta: {
        page,
        page_size: pageSize,
        total_items: total,
        total_pages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    next(error);
  }
});

playersRouter.get("/:id", async (req, res, next) => {
  try {
    const id = pathId(req.params.id);
    if (id === null) return res.status(400).json({ error: "Invalid player id" });
    const player = await database().player.findUnique({
      where: { id },
      include: {
        seasonSquadMembers: { include: { team: true, season: true } },
        careerBatting: true,
        careerBowling: true,
      },
    });
    if (!player) return res.status(404).json({ error: "Player not found" });
    res.json(player);
  } catch (error) {
    next(error);
  }
});

playersRouter.get("/:id/season-stats", async (req, res, next) => {
  try {
    const playerId = pathId(req.params.id);
    if (playerId === null) return res.status(400).json({ error: "Invalid player id" });
    const scope = queryScope(req.query.scope);
    const [batting, bowling] = await Promise.all([
      database().battingScore.findMany({
        where: { playerId },
        select: {
          runs: true,
          ballsFaced: true,
          fours: true,
          sixes: true,
          dismissal: true,
          inning: { select: { match: { select: { subtitle: true } } } },
        },
      }),
      database().bowlingFigure.findMany({
        where: { playerId },
        select: {
          overs: true,
          runsConceded: true,
          wickets: true,
          maidens: true,
          inning: { select: { match: { select: { subtitle: true } } } },
        },
      }),
    ]);
    const scopedBatting = batting.filter((row) => matchesScope(row.inning.match.subtitle, scope));
    const scopedBowling = bowling.filter((row) => matchesScope(row.inning.match.subtitle, scope));
    const runs = scopedBatting.reduce((sum, row) => sum + (row.runs ?? 0), 0);
    const balls = scopedBatting.reduce((sum, row) => sum + (row.ballsFaced ?? 0), 0);
    const wickets = scopedBowling.reduce((sum, row) => sum + (row.wickets ?? 0), 0);
    const runsConceded = scopedBowling.reduce((sum, row) => sum + (row.runsConceded ?? 0), 0);
    const ballsBowled = scopedBowling.reduce((sum, row) => sum + oversToBalls(row.overs), 0);
    const dismissals = scopedBatting.filter(
      (row) => row.dismissal && row.dismissal.toLowerCase() !== "not out",
    ).length;
    res.json({
      playerId,
      scope,
      batting: {
        innings: scopedBatting.length,
        runs,
        balls,
        fours: scopedBatting.reduce((sum, row) => sum + (row.fours ?? 0), 0),
        sixes: scopedBatting.reduce((sum, row) => sum + (row.sixes ?? 0), 0),
        average: dismissals ? runs / dismissals : null,
        strikeRate: balls ? (runs * 100) / balls : null,
      },
      bowling: {
        innings: scopedBowling.length,
        wickets,
        runsConceded,
        maidens: scopedBowling.reduce((sum, row) => sum + (row.maidens ?? 0), 0),
        economy: ballsBowled ? (runsConceded * 6) / ballsBowled : null,
      },
    });
  } catch (error) {
    next(error);
  }
});

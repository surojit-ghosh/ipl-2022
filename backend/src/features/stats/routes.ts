import { Router } from "express";

import { database } from "@/lib/db";
import { matchesScope, queryScope } from "@/lib/scope";

import {
  battingStats,
  bowlingStats,
  queryBattingCategory,
  queryBowlingCategory,
  teamPerformanceStats,
  venueStats,
} from "./service";

export const statsRouter = Router();

statsRouter.get("/batting", async (req, res, next) => {
  try {
    const scope = queryScope(req.query.scope);
    const category = queryBattingCategory(req.query.category);
    res.json({ scope, category, data: await battingStats(scope, category) });
  } catch (error) {
    next(error);
  }
});

statsRouter.get("/bowling", async (req, res, next) => {
  try {
    const scope = queryScope(req.query.scope);
    const category = queryBowlingCategory(req.query.category);
    res.json({ scope, category, data: await bowlingStats(scope, category) });
  } catch (error) {
    next(error);
  }
});

statsRouter.get("/teams", async (req, res, next) => {
  try {
    const scope = queryScope(req.query.scope);
    const [performance, matches] = await Promise.all([
      teamPerformanceStats(scope),
      database().match.findMany({
        select: { teamAId: true, teamBId: true, winningTeamId: true, subtitle: true },
      }),
    ]);
    const scopedMatches = matches.filter((match) => matchesScope(match.subtitle, scope));
    const matchCounts = new Map<number, { matches: number; wins: number; losses: number }>();
    for (const match of scopedMatches) {
      for (const teamId of [match.teamAId, match.teamBId]) {
        const counts = matchCounts.get(teamId) ?? { matches: 0, wins: 0, losses: 0 };
        counts.matches += 1;
        if (match.winningTeamId === teamId) counts.wins += 1;
        else if (match.winningTeamId !== null) counts.losses += 1;
        matchCounts.set(teamId, counts);
      }
    }
    const data = performance
      .map((stats) => {
        const counts = matchCounts.get(stats.team.id) ?? { matches: 0, wins: 0, losses: 0 };
        return {
          team: stats.team,
          scope,
          matches: counts.matches,
          wins: counts.wins,
          losses: counts.losses,
          runs: stats.runs,
          wickets: stats.wickets,
          runsConceded: stats.runsConceded,
          fifties: stats.fifties,
          centuries: stats.centuries,
          highestScore: stats.highestScore,
          lowestScore: stats.lowestScore,
          extrasConceded: stats.extrasConceded,
          fourWicketHauls: stats.fourWicketHauls,
          fiveWicketHauls: stats.fiveWicketHauls,
          highestWinMarginRuns: stats.highestWinMarginRuns,
          lowestWinMarginRuns: stats.lowestWinMarginRuns,
          highestWinMarginWickets: stats.highestWinMarginWickets,
          lowestWinMarginWickets: stats.lowestWinMarginWickets,
        };
      })
      .sort((a, b) => b.wins - a.wins);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

statsRouter.get("/summary", async (_req, res, next) => {
  try {
    const [matches, teams, players, batting, bowling] = await Promise.all([
      database().match.count(),
      database().team.count(),
      database().player.count(),
      battingStats("all"),
      bowlingStats("all"),
    ]);
    res.json({
      matches,
      teams,
      players,
      topBatters: batting.slice(0, 5),
      topBowlers: bowling.slice(0, 5),
    });
  } catch (error) {
    next(error);
  }
});

statsRouter.get("/venues", async (req, res, next) => {
  try {
    const scope = queryScope(req.query.scope);
    res.json({ scope, data: await venueStats(scope) });
  } catch (error) {
    next(error);
  }
});

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
    const [teams, performance] = await Promise.all([
      database().team.findMany({
        include: { matchesAsTeamA: true, matchesAsTeamB: true },
      }),
      teamPerformanceStats(scope),
    ]);
    const performanceByTeam = new Map(performance.map((item) => [item.team.id, item]));
    const data = teams
      .map((team) => {
        const matches = [...team.matchesAsTeamA, ...team.matchesAsTeamB];
        const scopedMatches = matches.filter((match) => matchesScope(match.subtitle, scope));
        const stats = performanceByTeam.get(team.id);
        return {
          team,
          scope,
          matches: scopedMatches.length,
          wins: scopedMatches.filter((match) => match.winningTeamId === team.id).length,
          losses: scopedMatches.filter(
            (match) => match.winningTeamId !== null && match.winningTeamId !== team.id,
          ).length,
          runs: stats?.runs ?? 0,
          wickets: stats?.wickets ?? 0,
          runsConceded: stats?.runsConceded ?? 0,
          fifties: stats?.fifties ?? 0,
          centuries: stats?.centuries ?? 0,
          highestScore: stats?.highestScore ?? null,
          lowestScore: stats?.lowestScore ?? null,
          extrasConceded: stats?.extrasConceded ?? 0,
          fourWicketHauls: stats?.fourWicketHauls ?? 0,
          fiveWicketHauls: stats?.fiveWicketHauls ?? 0,
          highestWinMarginRuns: stats?.highestWinMarginRuns ?? null,
          lowestWinMarginRuns: stats?.lowestWinMarginRuns ?? null,
          highestWinMarginWickets: stats?.highestWinMarginWickets ?? null,
          lowestWinMarginWickets: stats?.lowestWinMarginWickets ?? null,
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

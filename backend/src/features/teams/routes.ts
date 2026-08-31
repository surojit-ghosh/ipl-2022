import { Router } from "express";

import { database } from "@/lib/db";
import { pathId } from "@/lib/query";
import { matchesScope, queryScope } from "@/lib/scope";

export const teamsRouter = Router();

teamsRouter.get("/", async (_req, res, next) => {
  try {
    const teams = await database().team.findMany({ orderBy: { name: "asc" } });
    res.json({ data: teams });
  } catch (error) {
    next(error);
  }
});

teamsRouter.get("/:id", async (req, res, next) => {
  try {
    const id = pathId(req.params.id);
    if (id === null) return res.status(400).json({ error: "Invalid team id" });
    const team = await database().team.findUnique({
      where: { id },
      include: {
        seasonTeams: true,
        squadMembers: { include: { player: true, season: true } },
        standings: { include: { season: true } },
      },
    });
    if (!team) return res.status(404).json({ error: "Team not found" });
    const { squadMembers, ...teamData } = team;
    res.json({ ...teamData, seasonSquadMembers: squadMembers });
  } catch (error) {
    next(error);
  }
});

teamsRouter.get("/:id/stats", async (req, res, next) => {
  try {
    const teamId = pathId(req.params.id);
    if (teamId === null) return res.status(400).json({ error: "Invalid team id" });
    const scope = queryScope(req.query.scope);
    const [matches, snapshots] = await Promise.all([
      database().match.findMany({
        where: { OR: [{ teamAId: teamId }, { teamBId: teamId }] },
        select: { winningTeamId: true, subtitle: true },
      }),
      database().teamStatSnapshot.findMany({
        where: { teamId },
        orderBy: [{ seasonId: "asc" }, { metric: "asc" }],
        include: { season: { select: { year: true, slug: true } } },
      }),
    ]);
    const scopedMatches = matches.filter((match) => matchesScope(match.subtitle, scope));
    res.json({
      teamId,
      scope,
      matches: scopedMatches.length,
      wins: scopedMatches.filter((match) => match.winningTeamId === teamId).length,
      losses: scopedMatches.filter(
        (match) => match.winningTeamId !== null && match.winningTeamId !== teamId,
      ).length,
      snapshots,
    });
  } catch (error) {
    next(error);
  }
});

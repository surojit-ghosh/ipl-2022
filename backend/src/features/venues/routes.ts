import { Router } from "express";

import { database } from "@/lib/db";
import { pathId, validTimezone } from "@/lib/query";
import { scoreRuns } from "@/lib/scope";
import { matchCardSelect } from "@/features/matches/service";

export const venuesRouter = Router();

venuesRouter.get("/", async (_req, res, next) => {
  try {
    const venues = await database().venue.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { matches: true } } },
    });
    res.json({ data: venues.map((venue) => ({ ...venue, timezone: validTimezone(venue.timezone) })) });
  } catch (error) {
    next(error);
  }
});

venuesRouter.get("/:id", async (req, res, next) => {
  try {
    const id = pathId(req.params.id);
    if (id === null) return res.status(400).json({ error: "Invalid venue id" });
    const venue = await database().venue.findUnique({
      where: { id },
      include: {
        matches: {
          orderBy: [{ startAt: "desc" }, { id: "desc" }],
          select: matchCardSelect,
        },
      },
    });
    if (!venue) return res.status(404).json({ error: "Venue not found" });
    res.json({ ...venue, timezone: validTimezone(venue.timezone) });
  } catch (error) {
    next(error);
  }
});

venuesRouter.get("/:id/stats", async (req, res, next) => {
  try {
    const id = pathId(req.params.id);
    if (id === null) return res.status(400).json({ error: "Invalid venue id" });
    const innings = await database().inning.findMany({
      where: { match: { venueId: id } },
      select: { number: true, scores: true },
    });
    const firstInnings = innings.filter((inning) => inning.number === 1);
    const scores = firstInnings
      .map((inning) => scoreRuns(inning.scores))
      .filter((score): score is number => score !== null);
    res.json({
      venueId: id,
      matches: firstInnings.length,
      averageFirstInningsScore: scores.length
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : null,
      highestFirstInningsScore: scores.length ? Math.max(...scores) : null,
      lowestFirstInningsScore: scores.length ? Math.min(...scores) : null,
    });
  } catch (error) {
    next(error);
  }
});

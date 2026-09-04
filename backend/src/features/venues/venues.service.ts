import { matchCardSelect } from "@/features/matches/matches.service";
import { database } from "@/lib/db";
import { validTimezone } from "@/lib/format";
import { scoreRuns } from "@/lib/scope";

export async function listVenues() {
  const venues = await database().venue.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { matches: true } } },
  });
  return venues.map((venue) => ({ ...venue, timezone: validTimezone(venue.timezone) }));
}

export async function findVenue(id: number) {
  const venue = await database().venue.findUnique({
    where: { id },
    include: {
      matches: {
        orderBy: [{ startAt: "desc" }, { id: "desc" }],
        select: matchCardSelect,
      },
    },
  });
  return venue ? { ...venue, timezone: validTimezone(venue.timezone) } : null;
}

export async function venueExists(id: number) {
  const venue = await database().venue.findUnique({ where: { id }, select: { id: true } });
  return venue !== null;
}

export async function venueStats(venueId: number) {
  const innings = await database().inning.findMany({
    where: { match: { venueId } },
    select: { number: true, scores: true },
  });
  const firstInnings = innings.filter((inning) => inning.number === 1);
  const scores = firstInnings
    .map((inning) => scoreRuns(inning.scores))
    .filter((score): score is number => score !== null);
  return {
    venueId,
    matches: firstInnings.length,
    averageFirstInningsScore: scores.length
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length
      : null,
    highestFirstInningsScore: scores.length ? Math.max(...scores) : null,
    lowestFirstInningsScore: scores.length ? Math.min(...scores) : null,
  };
}

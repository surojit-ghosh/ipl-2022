import { database } from "@/lib/db";
import { validTimezone } from "@/lib/format";

const teamSelect = {
  id: true,
  name: true,
  abbreviation: true,
  alternateName: true,
  type: true,
  country: true,
  logoUrl: true,
  thumbnailUrl: true,
} as const;

export const matchCardSelect = {
  id: true,
  title: true,
  shortTitle: true,
  subtitle: true,
  matchNumber: true,
  statusText: true,
  statusNote: true,
  winMargin: true,
  startAt: true,
  teamAId: true,
  teamBId: true,
  venueId: true,
  winningTeamId: true,
  teamA: { select: teamSelect },
  teamB: { select: teamSelect },
  venue: { select: { id: true, name: true, location: true } },
  winningTeam: { select: { id: true, name: true, abbreviation: true } },
  innings: {
    orderBy: { number: "asc" as const },
    select: {
      number: true,
      scores: true,
      overs: true,
      battingTeamId: true,
      battingTeam: { select: teamSelect },
    },
  },
};

const PLAYOFF_MATCH_NUMBERS = ["71", "72", "73", "74"];

export async function listMatches(opts: {
  page: number;
  pageSize: number;
  teamId?: number;
  venueId?: number;
  stage?: "league" | "playoffs";
  order: "asc" | "desc";
}) {
  const stageFilter =
    opts.stage === "playoffs"
      ? { matchNumber: { in: PLAYOFF_MATCH_NUMBERS } }
      : opts.stage === "league"
        ? { NOT: { matchNumber: { in: PLAYOFF_MATCH_NUMBERS } } }
        : {};

  const where = {
    ...(opts.teamId ? { OR: [{ teamAId: opts.teamId }, { teamBId: opts.teamId }] } : {}),
    ...(opts.venueId ? { venueId: opts.venueId } : {}),
    ...stageFilter,
  };
  const db = database();
  const [matches, total] = await Promise.all([
    db.match.findMany({
      where,
      select: matchCardSelect,
      orderBy: [{ startAt: opts.order }, { id: opts.order }],
      skip: (opts.page - 1) * opts.pageSize,
      take: opts.pageSize,
    }),
    db.match.count({ where }),
  ]);
  return {
    data: matches,
    meta: {
      page: opts.page,
      page_size: opts.pageSize,
      total_items: total,
      total_pages: Math.ceil(total / opts.pageSize),
    },
  };
}

export async function latestMatch() {
  return database().match.findFirst({
    select: matchCardSelect,
    orderBy: [{ startAt: "desc" }, { id: "desc" }],
  });
}

export async function matchDetail(id: number) {
  const match = await database().match.findUnique({
    where: { id },
    include: {
      teamA: true,
      teamB: true,
      venue: true,
      winningTeam: true,
      tossWinner: true,
      playerOfMatch: true,
      officials: true,
      awards: { include: { player: true } },
      playingXi: { include: { team: true, player: true } },
      innings: {
        orderBy: { number: "asc" },
        include: {
          battingTeam: true,
          fieldingTeam: true,
          battingScores: { include: { player: true } },
          bowlingFigures: { include: { player: true } },
          fieldingFigures: { include: { player: true } },
          fallOfWickets: { include: { player: true } },
          extras: true,
        },
      },
    },
  });
  if (!match) return null;

  const playerIds = [
    ...match.innings.flatMap((inning) => [
      ...inning.battingScores.flatMap((score) => [
        score.bowlerId,
        score.firstFielderId,
        score.secondFielderId,
        score.thirdFielderId,
      ]),
      ...inning.fallOfWickets.map((wicket) => wicket.bowlerId),
    ]),
  ].filter((playerId): playerId is number => playerId !== null);
  const players = await database().player.findMany({ where: { id: { in: playerIds } } });
  const playerById = new Map(players.map((player) => [player.id, player]));

  return {
    ...match,
    venue: match.venue ? { ...match.venue, timezone: validTimezone(match.venue.timezone) } : null,
    innings: match.innings.map((inning) => ({
      ...inning,
      battingScores: inning.battingScores.map((score) => ({
        ...score,
        bowler: score.bowlerId ? playerById.get(score.bowlerId) ?? null : null,
        firstFielder: score.firstFielderId ? playerById.get(score.firstFielderId) ?? null : null,
        secondFielder: score.secondFielderId ? playerById.get(score.secondFielderId) ?? null : null,
        thirdFielder: score.thirdFielderId ? playerById.get(score.thirdFielderId) ?? null : null,
      })),
      fallOfWickets: inning.fallOfWickets.map((wicket) => ({
        ...wicket,
        bowler: wicket.bowlerId ? playerById.get(wicket.bowlerId) ?? null : null,
      })),
    })),
  };
}

export async function matchCommentary(id: number) {
  return database().commentaryEvent.findMany({
    where: { matchId: id },
    orderBy: [{ inningId: "asc" }, { sequenceNo: "asc" }],
    include: {
      batter: true,
      bowler: true,
      inning: {
        select: {
          number: true,
          name: true,
          battingTeam: { select: teamSelect },
        },
      },
    },
  });
}

export async function matchWagonWheel(
  id: number,
  opts: { inning?: number; batterId?: number; batRuns?: number; zone?: string },
) {
  return database().wagonShot.findMany({
    where: {
      matchId: id,
      ...(opts.inning ? { inning: { number: opts.inning } } : {}),
      ...(opts.batterId ? { batterId: opts.batterId } : {}),
      ...(opts.batRuns !== undefined ? { batRuns: opts.batRuns } : {}),
      ...(opts.zone ? { zoneName: opts.zone } : {}),
    },
    orderBy: [{ inningId: "asc" }, { sequenceNo: "asc" }],
    include: {
      batter: true,
      bowler: true,
      inning: {
        select: {
          number: true,
          name: true,
          battingTeam: { select: teamSelect },
        },
      },
    },
  });
}

export async function matchHistoricalSnapshot(id: number) {
  return database().sourceSnapshot.findFirst({
    where: {
      matchId: id,
      sourceFile: { sourceFamily: "match_live_details" },
    },
    select: {
      snapshotType: true,
      payload: true,
      sourceFile: {
        select: {
          relativePath: true,
          sha256: true,
          byteSize: true,
        },
      },
    },
  });
}

export async function matchExists(id: number) {
  const match = await database().match.findUnique({ where: { id }, select: { id: true } });
  return match !== null;
}

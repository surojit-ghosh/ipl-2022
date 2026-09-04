import { database } from "@/lib/db";
import { matchesScope, oversToBalls, type Scope } from "@/lib/scope";

export async function listPlayers(options: { page: number; pageSize: number; query?: string }) {
  const where = options.query
    ? { name: { contains: options.query, mode: "insensitive" as const } }
    : undefined;
  const db = database();
  const [data, total] = await Promise.all([
    db.player.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (options.page - 1) * options.pageSize,
      take: options.pageSize,
    }),
    db.player.count({ where }),
  ]);
  return {
    data,
    meta: {
      page: options.page,
      page_size: options.pageSize,
      total_items: total,
      total_pages: Math.ceil(total / options.pageSize),
    },
  };
}

export async function findPlayer(id: number) {
  return database().player.findUnique({
    where: { id },
    include: {
      seasonSquadMembers: { include: { team: true, season: true } },
      careerBatting: true,
      careerBowling: true,
    },
  });
}

export async function playerExists(id: number) {
  const player = await database().player.findUnique({ where: { id }, select: { id: true } });
  return player !== null;
}

export async function playerSeasonStats(playerId: number, scope: Scope) {
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
  return {
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
  };
}

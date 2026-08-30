import "dotenv/config";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

type TeamRecord = {
  tid: number;
  title: string;
  abbr?: string;
  alt_name?: string;
  type?: string;
  country?: string;
  logo_url?: string;
  thumb_url?: string;
};

type VenueRecord = {
  venue_id: string | number;
  name: string;
  location?: string;
  country?: string;
  timezone?: string;
};

type CompetitionRecord = {
  cid: number;
  title: string;
  abbr?: string;
  type?: string;
  category?: string;
  match_format?: string;
  season?: string;
};

type PlayerRecord = {
  pid: number | string;
  title: string;
  short_name?: string;
  first_name?: string;
  last_name?: string;
  birthdate?: string;
  birthplace?: string;
  country?: string;
  nationality?: string;
  playing_role?: string;
  batting_style?: string;
  bowling_style?: string;
  fielding_position?: string;
  logo_url?: string;
  thumb_url?: string;
};

type SquadRecord = {
  team_id: number;
  team: TeamRecord;
  players: PlayerRecord[];
};

type BatsmanRecord = {
  name: string;
  batsman_id: number | string;
  batting?: string;
  position?: string;
  role?: string;
  runs?: number | string;
  balls_faced?: number | string;
  fours?: number | string;
  sixes?: number | string;
  strike_rate?: number | string;
  dismissal?: string;
  how_out?: string;
  bowler_id?: number | string;
  first_fielder_id?: number | string;
  second_fielder_id?: number | string;
  third_fielder_id?: number | string;
};

type BowlerRecord = {
  name: string;
  bowler_id: number | string;
  bowling?: string;
  position?: string;
  overs?: string;
  maidens?: number | string;
  runs_conceded?: number | string;
  wickets?: number | string;
  noballs?: number | string;
  wides?: number | string;
  econ?: number | string;
};

type FielderRecord = {
  fielder_id: number | string;
  fielder_name: string;
  catches?: number | string;
  runout_thrower?: number | string;
  runout_catcher?: number | string;
  runout_direct_hit?: number | string;
  stumping?: number | string;
  is_substitute?: string | boolean;
};

type FallOfWicketRecord = {
  name: string;
  batsman_id?: number | string;
  runs?: number | string;
  balls?: number | string;
  how_out?: string;
  score_at_dismissal?: number | string;
  overs_at_dismissal?: string;
  bowler_id?: number | string;
  dismissal?: string;
  number: number | string;
};

type InningRecord = {
  iid: number;
  number: number;
  name?: string;
  status?: number;
  issuperover?: string | boolean;
  result?: number;
  batting_team_id: number;
  fielding_team_id: number;
  scores?: string;
  scores_full?: string;
  equations?: {
    overs?: string;
  };
  target?: number | string;
  batsmen?: BatsmanRecord[];
  bowlers?: BowlerRecord[];
  fielder?: FielderRecord[];
  fows?: FallOfWicketRecord[];
  extra_runs?: {
    byes?: number | string;
    legbyes?: number | string;
    wides?: number | string;
    noballs?: number | string;
    penalty?: number | string;
    total?: number | string;
  };
};

type StandingRecord = {
  team_id: number | string;
  played?: number | string;
  win?: number | string;
  loss?: number | string;
  draw?: number | string;
  nr?: number | string;
  overfor?: string;
  runfor?: number | string;
  overagainst?: string;
  runagainst?: number | string;
  netrr?: number | string;
  points?: number | string;
  lastfivematch?: string;
  lastfivematchresult?: string;
  team: TeamRecord & { tid: number };
};

type StandingsFile = {
  standings: Array<{
    round: {
      name: string;
    };
    standings: StandingRecord[];
  }>;
};

type TeamStatRecord = {
  team?: TeamRecord & { tid: number };
  [key: string]: unknown;
};

type ScorecardRecord = {
  match_id: number;
  title: string;
  short_title?: string;
  subtitle?: string;
  match_number?: string;
  format_str?: string;
  status?: number;
  status_str?: string;
  status_note?: string;
  result_type?: number;
  win_margin?: string;
  winning_team_id?: number;
  date_start?: string;
  date_end?: string;
  competition: CompetitionRecord;
  teama: TeamRecord & { team_id: number; name: string };
  teamb: TeamRecord & { team_id: number; name: string };
  venue?: VenueRecord;
  toss?: {
    winner?: number;
    decision?: number;
  };
  man_of_the_match?: {
    pid?: number;
    name?: string;
  };
  players?: PlayerRecord[];
  innings?: InningRecord[];
};

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});
const dataRoot = resolve(
  fileURLToPath(new URL(".", import.meta.url)),
  "data",
);

function toInt(value: unknown): number | null {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

function requiredInt(value: unknown, label: string): number {
  const parsed = toInt(value);
  if (parsed === null) throw new Error(`Missing integer: ${label}`);
  return parsed;
}

function positiveIntOrNull(value: unknown): number | null {
  const parsed = toInt(value);
  return parsed !== null && parsed > 0 ? parsed : null;
}

function toBoolean(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

function toFloat(value: unknown): number | null {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function dateOrNull(value: unknown): Date | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const date = new Date(`${value.replace(" ", "T")}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function upsertTeam(team: TeamRecord) {
  const data = {
    name: team.title,
    abbreviation: team.abbr ?? null,
    alternateName: team.alt_name ?? null,
    type: team.type ?? null,
    country: team.country ?? null,
    logoUrl: team.logo_url ?? null,
    thumbnailUrl: team.thumb_url ?? null,
  };

  return prisma.team.upsert({
    where: { id: requiredInt(team.tid, "team.tid") },
    update: data,
    create: {
      id: requiredInt(team.tid, "team.tid"),
      ...data,
    },
  });
}

async function seedTeams() {
  const file = await readFile(resolve(dataRoot, "teams/teams.json"), "utf8");
  const teams = JSON.parse(file) as TeamRecord[];

  for (const team of teams) await upsertTeam(team);
  console.log(`Seeded ${teams.length} teams`);
}

async function upsertCompetition(competition: CompetitionRecord) {
  return prisma.competition.upsert({
    where: { id: requiredInt(competition.cid, "competition.cid") },
    update: {
      title: competition.title,
      abbreviation: competition.abbr ?? null,
      type: competition.type ?? null,
      category: competition.category ?? null,
      matchFormat: competition.match_format ?? null,
    },
    create: {
      id: requiredInt(competition.cid, "competition.cid"),
      title: competition.title,
      abbreviation: competition.abbr ?? null,
      type: competition.type ?? null,
      category: competition.category ?? null,
      matchFormat: competition.match_format ?? null,
    },
  });
}

async function upsertSeason(
  competition: CompetitionRecord,
  competitionId: number,
) {
  const year = requiredInt(competition.season, "competition.season");

  return prisma.season.upsert({
    where: { year },
    update: { competitionId },
    create: {
      year,
      slug: `ipl-${year}`,
      competitionId,
    },
  });
}

async function upsertVenue(venue: VenueRecord) {
  const id = requiredInt(venue.venue_id, "venue.venue_id");

  return prisma.venue.upsert({
    where: { id },
    update: {
      name: venue.name,
      location: venue.location ?? null,
      country: venue.country ?? null,
      timezone: venue.timezone ?? null,
    },
    create: {
      id,
      name: venue.name,
      location: venue.location ?? null,
      country: venue.country ?? null,
      timezone: venue.timezone ?? null,
    },
  });
}

async function upsertPlayer(player: { pid: number | string; name: string }) {
  const data = {
    name: player.name,
  };

  return prisma.player.upsert({
    where: { id: requiredInt(player.pid, "player.pid") },
    update: data,
    create: { id: requiredInt(player.pid, "player.pid"), ...data },
  });
}

async function upsertPlayerProfile(player: PlayerRecord) {
  const data = {
    name: player.title,
    shortName: player.short_name ?? null,
    firstName: player.first_name ?? null,
    lastName: player.last_name ?? null,
    birthDate: dateOrNull(player.birthdate),
    birthPlace: player.birthplace?.trim() || null,
    country: player.country ?? null,
    nationality: player.nationality ?? null,
    playingRole: player.playing_role ?? null,
    battingStyle: player.batting_style ?? null,
    bowlingStyle: player.bowling_style ?? null,
    fieldingPosition: player.fielding_position ?? null,
    logoUrl: player.logo_url || null,
    thumbnailUrl: player.thumb_url || null,
  };

  return prisma.player.upsert({
    where: { id: requiredInt(player.pid, "player.pid") },
    update: data,
    create: { id: requiredInt(player.pid, "player.pid"), ...data },
  });
}

async function linkSeasonTeam(seasonId: number, teamId: number) {
  await prisma.seasonTeam.upsert({
    where: { seasonId_teamId: { seasonId, teamId } },
    update: {},
    create: { seasonId, teamId },
  });
}

async function ensurePlayer(id: unknown, name: string) {
  const playerId = positiveIntOrNull(id);
  if (playerId === null) return null;
  return upsertPlayer({ pid: playerId, name });
}

async function getDatasetSeason() {
  const entries = await readdir(resolve(dataRoot, "scorecards"));
  const filename = entries.find((entry) => entry.endsWith(".json"));
  if (!filename) throw new Error("No scorecard files found");

  const file = await readFile(resolve(dataRoot, "scorecards", filename), "utf8");
  const match = JSON.parse(file) as ScorecardRecord;
  const competition = await upsertCompetition(match.competition);
  return upsertSeason(match.competition, competition.id);
}

async function seedPlayersAndSquads() {
  const file = await readFile(resolve(dataRoot, "squads/squads.json"), "utf8");
  const squads = JSON.parse(file) as SquadRecord[];
  const season = await getDatasetSeason();
  let playerCount = 0;
  let membershipCount = 0;

  for (const squad of squads) {
    await upsertTeam(squad.team);

    for (const player of squad.players) {
      await upsertPlayerProfile(player);
      playerCount += 1;
      const teamId = requiredInt(squad.team_id, "squad.team_id");
      const playerId = requiredInt(player.pid, "player.pid");
      await linkSeasonTeam(season.id, teamId);

      await prisma.seasonSquadMember.upsert({
        where: {
          seasonId_teamId_playerId: {
            seasonId: season.id,
            teamId,
            playerId,
          },
        },
        update: { role: player.playing_role ?? null },
        create: {
          seasonId: season.id,
          teamId,
          playerId,
          role: player.playing_role ?? null,
        },
      });
      membershipCount += 1;
    }
  }

  console.log(
    `Seeded ${playerCount} squad player records and ${membershipCount} memberships`,
  );
}

async function seedMatches() {
  const entries = await readdir(resolve(dataRoot, "scorecards"), {
    withFileTypes: true,
  });
  const scorecardFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name);

  for (const filename of scorecardFiles) {
    const file = await readFile(resolve(dataRoot, "scorecards", filename), "utf8");
    const match = JSON.parse(file) as ScorecardRecord;
    const competition = await upsertCompetition(match.competition);
    const season = await upsertSeason(match.competition, competition.id);
    await upsertTeam({
      tid: match.teama.team_id,
      title: match.teama.name,
      abbr: match.teama.abbr,
      alt_name: match.teama.alt_name,
      type: match.teama.type,
      country: match.teama.country,
      logo_url: match.teama.logo_url,
      thumb_url: match.teama.thumb_url,
    });
    await upsertTeam({
      tid: match.teamb.team_id,
      title: match.teamb.name,
      abbr: match.teamb.abbr,
      alt_name: match.teamb.alt_name,
      type: match.teamb.type,
      country: match.teamb.country,
      logo_url: match.teamb.logo_url,
      thumb_url: match.teamb.thumb_url,
    });

    const venue = match.venue ? await upsertVenue(match.venue) : null;
    const playerOfMatch = match.man_of_the_match?.pid
      ? await upsertPlayer({
          pid: match.man_of_the_match.pid,
          name: match.man_of_the_match.name ?? "Unknown player",
        })
      : null;

    const savedMatch = await prisma.match.upsert({
      where: { id: requiredInt(match.match_id, "match.match_id") },
      update: {
        competitionId: competition.id,
        seasonId: season.id,
        teamAId: match.teama.team_id,
        teamBId: match.teamb.team_id,
        venueId: venue?.id ?? null,
        winningTeamId: toInt(match.winning_team_id),
        tossWinnerId: toInt(match.toss?.winner),
        playerOfMatchId: playerOfMatch?.id ?? null,
        title: match.title,
        shortTitle: match.short_title ?? null,
        subtitle: match.subtitle ?? null,
        matchNumber: match.match_number ?? null,
        format: match.format_str ?? null,
        status: toInt(match.status),
        statusText: match.status_str ?? null,
        statusNote: match.status_note ?? null,
        resultType: toInt(match.result_type),
        winMargin: match.win_margin ?? null,
        tossDecision: toInt(match.toss?.decision),
        startAt: dateOrNull(match.date_start),
        endAt: dateOrNull(match.date_end),
      },
      create: {
        id: requiredInt(match.match_id, "match.match_id"),
        competitionId: competition.id,
        seasonId: season.id,
        teamAId: match.teama.team_id,
        teamBId: match.teamb.team_id,
        venueId: venue?.id ?? null,
        winningTeamId: toInt(match.winning_team_id),
        tossWinnerId: toInt(match.toss?.winner),
        playerOfMatchId: playerOfMatch?.id ?? null,
        title: match.title,
        shortTitle: match.short_title ?? null,
        subtitle: match.subtitle ?? null,
        matchNumber: match.match_number ?? null,
        format: match.format_str ?? null,
        status: toInt(match.status),
        statusText: match.status_str ?? null,
        statusNote: match.status_note ?? null,
        resultType: toInt(match.result_type),
        winMargin: match.win_margin ?? null,
        tossDecision: toInt(match.toss?.decision),
        startAt: dateOrNull(match.date_start),
        endAt: dateOrNull(match.date_end),
      },
    });

    for (const player of match.players ?? []) {
      await upsertPlayerProfile(player);
    }

    await seedInnings(match.innings ?? [], savedMatch.id);
  }

  console.log(`Seeded ${scorecardFiles.length} matches`);
}

async function seedInnings(innings: InningRecord[], matchId: number) {
  await prisma.inning.deleteMany({ where: { matchId } });

  for (const inning of innings) {
    const inningId = requiredInt(inning.iid, "inning.iid");

    await prisma.inning.create({
      data: {
        id: inningId,
        matchId,
        number: requiredInt(inning.number, "inning.number"),
        name: inning.name ?? null,
        status: toInt(inning.status),
        isSuperOver: toBoolean(inning.issuperover),
        result: toInt(inning.result),
        battingTeamId: requiredInt(inning.batting_team_id, "inning.batting_team_id"),
        fieldingTeamId: requiredInt(
          inning.fielding_team_id,
          "inning.fielding_team_id",
        ),
        scores: inning.scores ?? null,
        overs: inning.equations?.overs ?? null,
        target: toInt(inning.target),
      },
    });

    for (const batsman of inning.batsmen ?? []) {
      const player = await ensurePlayer(batsman.batsman_id, batsman.name);
      if (!player) continue;

      await prisma.battingScore.create({
        data: {
          inningId,
          playerId: player.id,
          isBatting: toBoolean(batsman.batting),
          position: batsman.position || null,
          role: batsman.role || null,
          runs: toInt(batsman.runs),
          ballsFaced: toInt(batsman.balls_faced),
          fours: toInt(batsman.fours),
          sixes: toInt(batsman.sixes),
          strikeRate: toFloat(batsman.strike_rate),
          dismissal: batsman.dismissal || null,
          howOut: batsman.how_out || null,
          bowlerId: positiveIntOrNull(batsman.bowler_id),
          firstFielderId: positiveIntOrNull(batsman.first_fielder_id),
          secondFielderId: positiveIntOrNull(batsman.second_fielder_id),
          thirdFielderId: positiveIntOrNull(batsman.third_fielder_id),
        },
      });
    }

    for (const bowler of inning.bowlers ?? []) {
      const player = await ensurePlayer(bowler.bowler_id, bowler.name);
      if (!player) continue;

      await prisma.bowlingFigure.create({
        data: {
          inningId,
          playerId: player.id,
          isBowling: toBoolean(bowler.bowling),
          position: bowler.position || null,
          overs: bowler.overs || null,
          maidens: toInt(bowler.maidens),
          runsConceded: toInt(bowler.runs_conceded),
          wickets: toInt(bowler.wickets),
          noBalls: toInt(bowler.noballs),
          wides: toInt(bowler.wides),
          economy: toFloat(bowler.econ),
        },
      });
    }

    for (const fielder of inning.fielder ?? []) {
      const player = await ensurePlayer(
        fielder.fielder_id,
        fielder.fielder_name,
      );
      if (!player) continue;

      await prisma.fieldingFigure.create({
        data: {
          inningId,
          playerId: player.id,
          catches: toInt(fielder.catches),
          runOutThrower: toInt(fielder.runout_thrower),
          runOutCatcher: toInt(fielder.runout_catcher),
          directHits: toInt(fielder.runout_direct_hit),
          stumpings: toInt(fielder.stumping),
          substitute: toBoolean(fielder.is_substitute),
        },
      });
    }

    for (const wicket of inning.fows ?? []) {
      const player = await ensurePlayer(wicket.batsman_id, wicket.name);

      await prisma.fallOfWicket.create({
        data: {
          inningId,
          wicketNumber: requiredInt(wicket.number, "fall_of_wicket.number"),
          playerId: player?.id ?? null,
          runs: toInt(wicket.runs),
          balls: toInt(wicket.balls),
          dismissal: wicket.dismissal || null,
          howOut: wicket.how_out || null,
          scoreAtDismissal: toInt(wicket.score_at_dismissal),
          oversAtDismissal: wicket.overs_at_dismissal || null,
          bowlerId: positiveIntOrNull(wicket.bowler_id),
        },
      });
    }

    if (inning.extra_runs) {
      await prisma.inningExtra.create({
        data: {
          inningId,
          byes: toInt(inning.extra_runs.byes),
          legByes: toInt(inning.extra_runs.legbyes),
          wides: toInt(inning.extra_runs.wides),
          noBalls: toInt(inning.extra_runs.noballs),
          penalty: toInt(inning.extra_runs.penalty),
          total: toInt(inning.extra_runs.total),
        },
      });
    }
  }
}

async function seedStandings() {
  const file = await readFile(resolve(dataRoot, "standings/standings.json"), "utf8");
  const payload = JSON.parse(file) as StandingsFile;
  const season = await getDatasetSeason();
  let count = 0;

  for (const round of payload.standings) {
    for (const [index, standing] of round.standings.entries()) {
      const teamId = requiredInt(standing.team_id, "standing.team_id");
      await upsertTeam({
        tid: standing.team.tid,
        title: standing.team.title,
        abbr: standing.team.abbr,
        alt_name: standing.team.alt_name,
        type: standing.team.type,
        country: standing.team.country,
        logo_url: standing.team.logo_url,
        thumb_url: standing.team.thumb_url,
      });
      await linkSeasonTeam(season.id, teamId);

      await prisma.standing.upsert({
        where: { seasonId_teamId: { seasonId: season.id, teamId } },
        update: {
          position: index + 1,
          played: toInt(standing.played),
          wins: toInt(standing.win),
          losses: toInt(standing.loss),
          draws: toInt(standing.draw),
          noResults: toInt(standing.nr),
          oversFor: standing.overfor ?? null,
          runsFor: toInt(standing.runfor),
          oversAgainst: standing.overagainst ?? null,
          runsAgainst: toInt(standing.runagainst),
          netRunRate: toFloat(standing.netrr),
          points: toInt(standing.points),
          lastFiveMatches: standing.lastfivematch ?? null,
          lastFiveResults: standing.lastfivematchresult ?? null,
        },
        create: {
          seasonId: season.id,
          teamId,
          position: index + 1,
          played: toInt(standing.played),
          wins: toInt(standing.win),
          losses: toInt(standing.loss),
          draws: toInt(standing.draw),
          noResults: toInt(standing.nr),
          oversFor: standing.overfor ?? null,
          runsFor: toInt(standing.runfor),
          oversAgainst: standing.overagainst ?? null,
          runsAgainst: toInt(standing.runagainst),
          netRunRate: toFloat(standing.netrr),
          points: toInt(standing.points),
          lastFiveMatches: standing.lastfivematch ?? null,
          lastFiveResults: standing.lastfivematchresult ?? null,
        },
      });
      count += 1;
    }
  }

  console.log(`Seeded ${count} standings`);
}

async function seedTeamStats() {
  const entries = await readdir(resolve(dataRoot, "team_stats"), {
    withFileTypes: true,
  });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name);
  const season = await getDatasetSeason();
  let count = 0;

  for (const filename of files) {
    const file = await readFile(resolve(dataRoot, "team_stats", filename), "utf8");
    const parsed = JSON.parse(file) as {
      response?: { stats?: TeamStatRecord[] };
      stats?: TeamStatRecord[];
    };
    const stats = parsed.response?.stats ?? parsed.stats ?? [];
    const metric = filename.replace(/\.json$/i, "");

    for (const stat of stats) {
      if (!stat.team) continue;
      const teamId = requiredInt(stat.team.tid, "team_stat.team.tid");
      await upsertTeam({
        tid: teamId,
        title: stat.team.title,
        abbr: stat.team.abbr,
        alt_name: stat.team.alt_name,
        type: stat.team.type,
        country: stat.team.country,
        logo_url: stat.team.logo_url,
        thumb_url: stat.team.thumb_url,
      });
      await linkSeasonTeam(season.id, teamId);

      await prisma.teamStatSnapshot.upsert({
        where: {
          seasonId_teamId_metric: {
            seasonId: season.id,
            teamId,
            metric,
          },
        },
        update: { values: stat as Prisma.InputJsonValue },
        create: {
          seasonId: season.id,
          teamId,
          metric,
          values: stat as Prisma.InputJsonValue,
        },
      });
      count += 1;
    }
  }

  console.log(`Seeded ${count} team stat snapshots`);
}

async function main() {
  await seedTeams();
  await seedPlayersAndSquads();
  await seedMatches();
  await seedStandings();
  await seedTeamStats();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

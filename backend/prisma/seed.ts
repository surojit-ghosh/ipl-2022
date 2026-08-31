import "dotenv/config";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

type JsonObject = Record<string, unknown>;

function asObject(value: unknown): JsonObject {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : {};
}

function valueOf(object: JsonObject, key: string): unknown {
  return object[key];
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function integerValue(value: unknown): number | null {
  return toInt(value);
}

function floatValue(value: unknown): number | null {
  return toFloat(value);
}

function arrayValue(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function jsonInput(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

async function readJsonFile(path: string): Promise<unknown> {
  return JSON.parse(await readFile(path, "utf8")) as unknown;
}

function unixDate(value: unknown): Date | null {
  const timestamp = integerValue(value);
  if (timestamp === null) return null;
  const date = new Date(timestamp * 1000);
  return Number.isNaN(date.getTime()) ? null : date;
}

function countRecords(value: unknown): number | null {
  if (Array.isArray(value)) return value.length;
  const object = asObject(value);
  const response = asObject(valueOf(object, "response"));
  const stats = valueOf(response, "stats") ?? valueOf(object, "stats");
  return Array.isArray(stats) ? stats.length : null;
}

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
  did_not_bat?: Array<{ player_id: number | string; name: string }>;
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

function splitOutsideParentheses(value: string): string[] {
  const values: string[] = [];
  let current = "";
  let depth = 0;

  for (const character of value) {
    if (character === "(") depth += 1;
    if (character === ")") depth = Math.max(0, depth - 1);
    if (character === "," && depth === 0) {
      values.push(current);
      current = "";
    } else {
      current += character;
    }
  }

  values.push(current);
  return values;
}

function officialNames(value: unknown): {
  name: string;
  country: string | null;
  isTvUmpire: boolean;
}[] {
  return stringValue(value)
    ? splitOutsideParentheses(stringValue(value)!)
        .map((entry) => {
          const metadata = entry.match(/\(([^)]*)\)\s*$/)?.[1] ?? "";
          const details = metadata
            .split(",")
            .map((detail) => detail.trim())
            .filter(Boolean);
          return {
            name: entry.replace(/\s*\([^)]*\)\s*$/, "").trim(),
            country: details.find((detail) => detail.toLowerCase() !== "tv") ?? null,
            isTvUmpire: details.some((detail) => detail.toLowerCase() === "tv"),
          };
        })
        .filter((official) => official.name)
    : [];
}

async function seedMatchInfo() {
  const entries = await readdir(resolve(dataRoot, "match_info"), {
    withFileTypes: true,
  });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name);

  for (const filename of files) {
    const payload = asObject(
      await readJsonFile(resolve(dataRoot, "match_info", filename)),
    );
    const matchId = requiredInt(valueOf(payload, "match_id"), `${filename}.match_id`);
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) throw new Error(`Match info references missing match: ${matchId}`);

    const venue = asObject(valueOf(payload, "venue"));
    const venueId = integerValue(valueOf(venue, "venue_id"));
    if (match.venueId === null && venueId !== null) {
      await upsertVenue({
        venue_id: venueId,
        name: stringValue(valueOf(venue, "name")) ?? "Unknown venue",
        location: stringValue(valueOf(venue, "location")) ?? undefined,
        country: stringValue(valueOf(venue, "country")) ?? undefined,
        timezone: stringValue(valueOf(venue, "timezone")) ?? undefined,
      });
      await prisma.match.update({
        where: { id: matchId },
        data: { venueId },
      });
    }

    await prisma.matchOfficial.deleteMany({ where: { matchId } });
    const officials = [
      ...officialNames(valueOf(payload, "umpires")).map((official) => ({
        role: "umpire",
        ...official,
      })),
      ...officialNames(valueOf(payload, "referee")).map((official) => ({
        role: "referee",
        ...official,
      })),
    ];
    for (const [position, official] of officials.entries()) {
      await prisma.matchOfficial.create({
        data: { matchId, ...official, position },
      });
    }

    await prisma.matchAward.deleteMany({ where: { matchId } });
    for (const [awardType, key] of [
      ["player_of_match", "man_of_the_match"],
      ["player_of_series", "man_of_the_series"],
    ] as const) {
      const award = asObject(valueOf(payload, key));
      const playerId = positiveIntOrNull(valueOf(award, "pid"));
      const sourceName = stringValue(valueOf(award, "name"));
      if (playerId === null && sourceName === null) continue;
      const player = playerId === null
        ? null
        : await ensurePlayer(playerId, sourceName ?? "Unknown player");
      await prisma.matchAward.create({
        data: {
          matchId,
          awardType,
          playerId: player?.id ?? null,
          sourceName,
        },
      });
    }
  }

  console.log(`Seeded ${files.length} match info records`);
}

async function seedMatchAwards() {
  const entries = await readdir(resolve(dataRoot, "scorecards"), {
    withFileTypes: true,
  });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name);

  for (const filename of files) {
    const payload = asObject(
      await readJsonFile(resolve(dataRoot, "scorecards", filename)),
    );
    const matchId = requiredInt(valueOf(payload, "match_id"), `${filename}.match_id`);
    await prisma.matchAward.deleteMany({ where: { matchId } });
    const awards: Array<[string, JsonObject]> = [];
    const playerOfMatch = asObject(valueOf(payload, "man_of_the_match"));
    if (positiveIntOrNull(valueOf(playerOfMatch, "pid")) !== null) {
      awards.push(["player_of_match", playerOfMatch]);
    }
    const isFinal = stringValue(valueOf(payload, "subtitle"))?.toLowerCase() === "final";
    const playerOfSeries = asObject(valueOf(payload, "man_of_the_series"));
    if (isFinal && positiveIntOrNull(valueOf(playerOfSeries, "pid")) !== null) {
      awards.push(["player_of_series", playerOfSeries]);
    }

    for (const [awardType, award] of awards) {
      const playerId = requiredInt(valueOf(award, "pid"), `${filename}.${awardType}.pid`);
      const player = await ensurePlayer(
        playerId,
        stringValue(valueOf(award, "name")) ?? "Unknown player",
      );
      await prisma.matchAward.create({
        data: {
          matchId,
          awardType,
          playerId: player?.id ?? null,
          sourceName: stringValue(valueOf(award, "name")),
        },
      });
    }
  }

  console.log(`Seeded awards for ${files.length} matches`);
}

async function seedInnings(innings: InningRecord[], matchId: number) {
  await prisma.inning.deleteMany({ where: { matchId } });
  await prisma.matchPlayingXi.deleteMany({ where: { matchId } });

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

    for (const [index, batsman] of (inning.batsmen ?? []).entries()) {
      const playerId = positiveIntOrNull(batsman.batsman_id);
      if (playerId === null) continue;

      await prisma.matchPlayingXi.upsert({
        where: {
          matchId_teamId_playerId: {
            matchId,
            teamId: inning.batting_team_id,
            playerId,
          },
        },
        update: { battingOrder: index + 1, isDidNotBat: false },
        create: {
          matchId,
          teamId: inning.batting_team_id,
          playerId,
          battingOrder: index + 1,
          isDidNotBat: false,
        },
      });
    }

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

    for (const playerRecord of inning.did_not_bat ?? []) {
      const player = await ensurePlayer(playerRecord.player_id, playerRecord.name);
      if (!player) continue;

      await prisma.matchPlayingXi.upsert({
        where: {
          matchId_teamId_playerId: {
            matchId,
            teamId: inning.batting_team_id,
            playerId: player.id,
          },
        },
        update: { battingOrder: null, isDidNotBat: true },
        create: {
          matchId,
          teamId: inning.batting_team_id,
          playerId: player.id,
          battingOrder: null,
          isDidNotBat: true,
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

  console.log(`Processed ${count} team stat snapshot records`);
}

async function listJsonFiles(
  directory: string,
  root = directory,
): Promise<Array<{ relativePath: string; absolutePath: string }>> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: Array<{ relativePath: string; absolutePath: string }> = [];

  for (const entry of entries) {
    const entryPath = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listJsonFiles(entryPath, root));
    if (entry.isFile() && entry.name.endsWith(".json")) {
      files.push({
        relativePath: relative(root, entryPath).replaceAll("\\", "/"),
        absolutePath: entryPath,
      });
    }
  }

  return files;
}

async function countJsonFiles(directory: string): Promise<number> {
  return (await listJsonFiles(directory)).length;
}

async function seedSourceFiles() {
  const files = await listJsonFiles(dataRoot);
  const archiveFamilies = new Set([
    "match_live_details",
    "batting_stats",
    "bowling_stats",
    "team_stats",
  ]);

  for (const file of files) {
    const contents = await readFile(file.absolutePath);
    const payload = JSON.parse(contents.toString()) as unknown;
    const sourceFamily = file.relativePath.split("/")[0];
    const sourceFile = await prisma.sourceFile.upsert({
      where: { relativePath: file.relativePath },
      update: {
        sourceFamily,
        sha256: createHash("sha256").update(contents).digest("hex"),
        byteSize: contents.byteLength,
        recordCount: countRecords(payload),
        status: "loaded",
      },
      create: {
        relativePath: file.relativePath,
        sourceFamily,
        sha256: createHash("sha256").update(contents).digest("hex"),
        byteSize: contents.byteLength,
        recordCount: countRecords(payload),
        status: "loaded",
      },
    });

    if (!archiveFamilies.has(sourceFamily)) continue;
    const object = asObject(payload);
    const matchId = integerValue(
      valueOf(object, "mid") ?? valueOf(object, "match_id"),
    );
    await prisma.sourceSnapshot.upsert({
      where: { sourceFileId: sourceFile.id },
      update: {
        snapshotType: file.relativePath.replace(/\.json$/i, ""),
        matchId,
        payload: jsonInput(payload),
      },
      create: {
        sourceFileId: sourceFile.id,
        snapshotType: file.relativePath.replace(/\.json$/i, ""),
        matchId,
        payload: jsonInput(payload),
      },
    });
  }

  console.log(`Tracked ${files.length} source files`);
}

async function seedCommentary() {
  const entries = await readdir(resolve(dataRoot, "match_innings_commentary"), {
    withFileTypes: true,
  });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name);
  let eventCount = 0;

  for (const filename of files) {
    const payload = asObject(
      await readJsonFile(resolve(dataRoot, "match_innings_commentary", filename)),
    );
    const inning = asObject(valueOf(payload, "inning"));
    const inningId = requiredInt(valueOf(inning, "iid"), `${filename}.inning.iid`);
    const savedInning = await prisma.inning.findUnique({
      where: { id: inningId },
      select: { matchId: true },
    });
    if (!savedInning) throw new Error(`Commentary references missing inning: ${inningId}`);
    await prisma.commentaryEvent.deleteMany({ where: { inningId } });

    for (const [sequenceNo, item] of arrayValue(valueOf(payload, "commentaries")).entries()) {
      const event = asObject(item);
      const batterId = positiveIntOrNull(valueOf(event, "batsman_id"));
      const bowlerId = positiveIntOrNull(valueOf(event, "bowler_id"));
      await prisma.commentaryEvent.create({
        data: {
          sourceEventId: positiveIntOrNull(valueOf(event, "event_id")),
          matchId: savedInning.matchId,
          inningId,
          eventType: stringValue(valueOf(event, "event")) ?? "unknown",
          sourceOver: integerValue(valueOf(event, "over")),
          sourceBall: integerValue(valueOf(event, "ball")),
          sequenceNo,
          occurredAt: unixDate(valueOf(event, "timestamp")),
          batterId,
          bowlerId,
          totalRuns: integerValue(valueOf(event, "run")),
          batRuns: integerValue(valueOf(event, "bat_run")),
          noBallRuns: integerValue(valueOf(event, "noball_run")),
          wideRuns: integerValue(valueOf(event, "wide_run")),
          byeRuns: integerValue(valueOf(event, "bye_run")),
          legByeRuns: integerValue(valueOf(event, "legbye_run")),
          isNoBall: valueOf(event, "noball") as boolean | null,
          isWide: valueOf(event, "wideball") as boolean | null,
          isFour: valueOf(event, "four") as boolean | null,
          isSix: valueOf(event, "six") as boolean | null,
          isWicket: stringValue(valueOf(event, "event")) === "wicket",
          commentary: stringValue(valueOf(event, "commentary")),
          detailText: stringValue(valueOf(event, "text")),
        },
      });
      eventCount += 1;
    }
  }

  console.log(`Seeded ${eventCount} commentary events`);
}

async function seedWagon() {
  const entries = await readdir(resolve(dataRoot, "match_wagon_wheel"), {
    withFileTypes: true,
  });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name);
  let shotCount = 0;

  for (const filename of files) {
    const payload = asObject(
      await readJsonFile(resolve(dataRoot, "match_wagon_wheel", filename)),
    );
    const fields = arrayValue(valueOf(payload, "wagon_fields")).map(String);
    for (const inningItem of arrayValue(valueOf(payload, "innings"))) {
      const inning = asObject(inningItem);
      const inningId = requiredInt(valueOf(inning, "inning_id"), `${filename}.inning_id`);
      const savedInning = await prisma.inning.findUnique({
        where: { id: inningId },
        select: { matchId: true },
      });
      if (!savedInning) throw new Error(`Wagon references missing inning: ${inningId}`);
      await prisma.wagonShot.deleteMany({ where: { inningId } });
      const zones = arrayValue(valueOf(payload, "zones")).map(String);
      for (const [sequenceNo, row] of arrayValue(valueOf(inning, "wagons")).entries()) {
        const values = Array.isArray(row) ? row : [];
        const mapped = Object.fromEntries(fields.map((field, index) => [field, values[index]]));
        const zoneId = integerValue(mapped.zone_id);
        await prisma.wagonShot.create({
          data: {
            matchId: savedInning.matchId,
            inningId,
            sequenceNo,
            batterId: positiveIntOrNull(mapped.batsman_id),
            bowlerId: positiveIntOrNull(mapped.bowler_id),
            sourceOver: floatValue(mapped.over),
            batRuns: integerValue(mapped.bat_run),
            teamRuns: integerValue(mapped.team_run),
            x: floatValue(mapped.x),
            y: floatValue(mapped.y),
            zoneId,
            zoneName: zoneId === null ? null : zones[zoneId - 1] ?? null,
            eventName: stringValue(mapped.event_name),
            uniqueOver: floatValue(mapped.unique_over),
          },
        });
        shotCount += 1;
      }
    }
  }

  console.log(`Seeded ${shotCount} wagon shots`);
}

const careerFormats = ["test", "odi", "t20i", "t20", "lista", "firstclass"] as const;

async function seedCareerStats() {
  const entries = await readdir(resolve(dataRoot, "player_career_stats"), {
    withFileTypes: true,
  });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name);
  let battingCount = 0;
  let bowlingCount = 0;

  for (const filename of files) {
    const payload = asObject(
      await readJsonFile(resolve(dataRoot, "player_career_stats", filename)),
    );
    const playerRecord = asObject(valueOf(payload, "player"));
    const playerId = requiredInt(valueOf(playerRecord, "pid"), `${filename}.player.pid`);
    await upsertPlayerProfile(playerRecord as unknown as PlayerRecord);
    const batting = asObject(valueOf(payload, "batting"));
    const bowling = asObject(valueOf(payload, "bowling"));

    for (const format of careerFormats) {
      const battingRecord = asObject(valueOf(batting, format));
      if (Object.keys(battingRecord).length > 0) {
        await prisma.playerCareerBatting.upsert({
          where: { playerId_format: { playerId, format } },
          update: careerBattingData(battingRecord),
          create: { playerId, format, ...careerBattingData(battingRecord) },
        });
        battingCount += 1;
      }

      const bowlingRecord = asObject(valueOf(bowling, format));
      if (Object.keys(bowlingRecord).length > 0) {
        await prisma.playerCareerBowling.upsert({
          where: { playerId_format: { playerId, format } },
          update: careerBowlingData(bowlingRecord),
          create: { playerId, format, ...careerBowlingData(bowlingRecord) },
        });
        bowlingCount += 1;
      }
    }
  }

  console.log(`Seeded ${battingCount} batting and ${bowlingCount} bowling career snapshots`);
}

async function expectedCareerCounts() {
  const files = await listJsonFiles(resolve(dataRoot, "player_career_stats"));
  let batting = 0;
  let bowling = 0;
  for (const file of files) {
    const payload = asObject(await readJsonFile(file.absolutePath));
    const battingRecords = asObject(valueOf(payload, "batting"));
    const bowlingRecords = asObject(valueOf(payload, "bowling"));
    for (const format of careerFormats) {
      if (Object.keys(asObject(valueOf(battingRecords, format))).length) batting += 1;
      if (Object.keys(asObject(valueOf(bowlingRecords, format))).length) bowling += 1;
    }
  }
  return { batting, bowling };
}

function careerBattingData(record: JsonObject) {
  return {
    matches: integerValue(valueOf(record, "matches")),
    innings: integerValue(valueOf(record, "innings")),
    notOuts: integerValue(valueOf(record, "notout")),
    runs: integerValue(valueOf(record, "runs")),
    balls: integerValue(valueOf(record, "balls")),
    highest: integerValue(valueOf(record, "highest")),
    hundreds: integerValue(valueOf(record, "run100")),
    fifties: integerValue(valueOf(record, "run50")),
    fours: integerValue(valueOf(record, "run4")),
    sixes: integerValue(valueOf(record, "run6")),
    catches: integerValue(valueOf(record, "catches")),
    stumpings: integerValue(valueOf(record, "stumpings")),
    sourceAverage: floatValue(valueOf(record, "average")),
    sourceStrike: floatValue(valueOf(record, "strike")),
  };
}

function careerBowlingData(record: JsonObject) {
  return {
    matches: integerValue(valueOf(record, "matches")),
    innings: integerValue(valueOf(record, "innings")),
    balls: integerValue(valueOf(record, "balls")),
    overs: floatValue(valueOf(record, "overs")),
    runs: integerValue(valueOf(record, "runs")),
    wickets: integerValue(valueOf(record, "wickets")),
    bestInning: stringValue(valueOf(record, "bestinning")),
    bestMatch: stringValue(valueOf(record, "bestmatch")),
    fours: integerValue(valueOf(record, "wicket4i")),
    fives: integerValue(valueOf(record, "wicket5i")),
    tens: integerValue(valueOf(record, "wicket10m")),
    hatTricks: integerValue(valueOf(record, "hattrick")),
    maidens: integerValue(valueOf(record, "maidens")),
    sourceEconomy: floatValue(valueOf(record, "econ")),
    sourceAverage: floatValue(valueOf(record, "average")),
    sourceStrike: floatValue(valueOf(record, "strike")),
  };
}

async function assertSeedReport() {
  const report = {
    sourceFiles: await countJsonFiles(dataRoot),
    teams: await prisma.team.count(),
    players: await prisma.player.count(),
    matches: await prisma.match.count(),
    innings: await prisma.inning.count(),
    playingXi: await prisma.matchPlayingXi.count(),
    officials: await prisma.matchOfficial.count(),
    awards: await prisma.matchAward.count(),
    commentaryEvents: await prisma.commentaryEvent.count(),
    wagonShots: await prisma.wagonShot.count(),
    careerBatting: await prisma.playerCareerBatting.count(),
    careerBowling: await prisma.playerCareerBowling.count(),
    standings: await prisma.standing.count(),
    teamStatSnapshots: await prisma.teamStatSnapshot.count(),
    sourceSnapshots: await prisma.sourceSnapshot.count(),
  };
  const expected = {
    sourceFiles: 729,
    teams: 10,
    players: 247,
    matches: 74,
    innings: 148,
    playingXi: 1628,
    officials: 296,
    awards: 75,
    commentaryEvents: 20749,
    wagonShots: 17912,
    standings: 10,
    teamStatSnapshots: 120,
    sourceSnapshots: 108,
  };

  const careerExpected = await expectedCareerCounts();
  for (const [key, expectedCount] of Object.entries(expected)) {
    const actual = report[key as keyof typeof report];
    if (actual !== expectedCount) {
      throw new Error(
        `Seed count mismatch for ${key}: expected ${expectedCount}, got ${actual}`,
      );
    }
  }
  if (report.careerBatting !== careerExpected.batting || report.careerBowling !== careerExpected.bowling) {
    throw new Error(
      `Seed career count mismatch: expected ${JSON.stringify(careerExpected)}, got ${JSON.stringify({
        batting: report.careerBatting,
        bowling: report.careerBowling,
      })}`,
    );
  }

  console.log(`Seed report ${JSON.stringify(report)}`);
}

async function main() {
  await seedTeams();
  await seedPlayersAndSquads();
  await seedMatches();
  await seedMatchInfo();
  await seedMatchAwards();
  await seedCareerStats();
  await seedCommentary();
  await seedWagon();
  await seedStandings();
  await seedTeamStats();
  await seedSourceFiles();
  await assertSeedReport();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

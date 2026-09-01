import { database } from "@/lib/db";
import { enumQuery } from "@/lib/query";
import { matchesScope, oversToBalls, scoreRuns, type Scope } from "@/lib/scope";

export const BATTING_CATEGORIES = [
  "batting_most_runs",
  "batting_most_runs_innings",
  "batting_highest_strikerate",
  "batting_highest_strikerate_innings",
  "batting_highest_average",
  "batting_most_run100",
  "batting_most_run50",
  "batting_most_run6",
  "batting_most_run6_innings",
  "batting_most_run4",
  "batting_most_run4_innings",
] as const;

export type BattingCategory = (typeof BATTING_CATEGORIES)[number];

export function queryBattingCategory(value: unknown): BattingCategory {
  return enumQuery(value, BATTING_CATEGORIES, "category", "batting_most_runs");
}

function rate(runs: number, balls: number) {
  return balls ? (runs * 100) / balls : null;
}

export async function battingStats(
  scope: Scope = "all",
  category: BattingCategory = "batting_most_runs",
) {
  const rows = await database().battingScore.findMany({
    select: {
      id: true,
      playerId: true,
      runs: true,
      ballsFaced: true,
      fours: true,
      sixes: true,
      dismissal: true,
      player: {
        select: {
          id: true,
          name: true,
          shortName: true,
          logoUrl: true,
          thumbnailUrl: true,
        },
      },
      inning: {
        select: {
          match: { select: { id: true, title: true, subtitle: true } },
        },
      },
    },
  });

  const scopedRows = rows.filter((row) => matchesScope(row.inning.match.subtitle, scope));
  const inningsRows = scopedRows.map((row) => {
    const runs = row.runs ?? 0;
    const balls = row.ballsFaced ?? 0;
    return {
      id: row.id,
      player: row.player,
      innings: 1,
      runs,
      balls,
      fours: row.fours ?? 0,
      sixes: row.sixes ?? 0,
      strikeRate: rate(runs, balls),
      average: row.dismissal ? runs : null,
      centuries: runs >= 100 ? 1 : 0,
      fifties: runs >= 50 && runs < 100 ? 1 : 0,
      highestScore: runs,
      match: row.inning.match,
    };
  });

  type BattingTotals = Omit<(typeof inningsRows)[number], "match"> & {
    match: (typeof inningsRows)[number]["match"] | null;
    dismissals: number;
  };
  const totals = new Map<number, BattingTotals>();
  for (const row of scopedRows) {
    const current = totals.get(row.playerId) ?? {
      id: row.playerId,
      player: row.player,
      innings: 0,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      strikeRate: null,
      average: null,
      centuries: 0,
      fifties: 0,
      highestScore: 0,
      match: null,
      dismissals: 0,
    };
    const runs = row.runs ?? 0;
    current.innings += 1;
    current.runs += runs;
    current.balls += row.ballsFaced ?? 0;
    current.fours += row.fours ?? 0;
    current.sixes += row.sixes ?? 0;
    current.centuries += runs >= 100 ? 1 : 0;
    current.fifties += runs >= 50 && runs < 100 ? 1 : 0;
    current.highestScore = Math.max(current.highestScore, runs);
    current.dismissals += row.dismissal ? 1 : 0;
    totals.set(row.playerId, current);
  }

  const aggregateRows = [...totals.values()].map(({ dismissals, ...row }) => ({
    ...row,
    strikeRate: rate(row.runs, row.balls),
    average: dismissals ? row.runs / dismissals : null,
  }));
  const isInningsCategory = category.endsWith("_innings");
  const result = isInningsCategory ? inningsRows : aggregateRows;
  const value = (row: (typeof result)[number]) => {
    switch (category) {
      case "batting_most_runs":
        return row.runs;
      case "batting_most_runs_innings":
        return row.highestScore;
      case "batting_highest_strikerate":
      case "batting_highest_strikerate_innings":
        return row.strikeRate;
      case "batting_highest_average":
        return row.average;
      case "batting_most_run100":
        return row.centuries;
      case "batting_most_run50":
        return row.fifties;
      case "batting_most_run6":
      case "batting_most_run6_innings":
        return row.sixes;
      case "batting_most_run4":
      case "batting_most_run4_innings":
        return row.fours;
    }
  };

  return result
    .sort((a, b) => {
      const difference = (value(b) ?? -1) - (value(a) ?? -1);
      return difference || a.player.name.localeCompare(b.player.name);
    })
    .slice(0, 100);
}

export const BOWLING_CATEGORIES = [
  "bowling_top_wicket_takers",
  "bowling_best_economy_rates",
  "bowling_best_economy_rates_innings",
  "bowling_best_bowling_figures",
  "bowling_best_strike_rates",
  "bowling_best_strike_rates_innings",
  "bowling_best_averages",
  "bowling_most_runs_conceded_innings",
  "bowling_four_wickets",
  "bowling_five_wickets",
  "bowling_maidens",
] as const;

export type BowlingCategory = (typeof BOWLING_CATEGORIES)[number];

export function queryBowlingCategory(value: unknown): BowlingCategory {
  return enumQuery(value, BOWLING_CATEGORIES, "category", "bowling_top_wicket_takers");
}

export async function bowlingStats(
  scope: Scope = "all",
  category: BowlingCategory = "bowling_top_wicket_takers",
) {
  const rows = await database().bowlingFigure.findMany({
    select: {
      id: true,
      playerId: true,
      overs: true,
      maidens: true,
      runsConceded: true,
      wickets: true,
      player: {
        select: {
          id: true,
          name: true,
          shortName: true,
          logoUrl: true,
          thumbnailUrl: true,
        },
      },
      inning: {
        select: {
          match: { select: { id: true, title: true, subtitle: true } },
        },
      },
    },
  });
  const scopedRows = rows.filter((row) => matchesScope(row.inning.match.subtitle, scope));
  const inningsRows = scopedRows.map((row) => {
    const wickets = row.wickets ?? 0;
    const runsConceded = row.runsConceded ?? 0;
    const balls = oversToBalls(row.overs);
    return {
      id: row.id,
      player: row.player,
      innings: 1,
      wickets,
      runsConceded,
      balls,
      maidens: row.maidens ?? 0,
      economy: balls ? (runsConceded * 6) / balls : null,
      strikeRate: wickets ? balls / wickets : null,
      average: wickets ? runsConceded / wickets : null,
      bestFigures: wickets ? `${wickets}/${runsConceded}` : null,
      fourWicketHauls: wickets >= 4 ? 1 : 0,
      fiveWicketHauls: wickets >= 5 ? 1 : 0,
      match: row.inning.match,
    };
  });
  const totals = new Map<
    number,
    {
      id: number;
      player: (typeof rows)[number]["player"];
      innings: number;
      wickets: number;
      runsConceded: number;
      balls: number;
      maidens: number;
      fourWicketHauls: number;
      fiveWicketHauls: number;
    }
  >();
  for (const row of scopedRows) {
    const total = totals.get(row.playerId) ?? {
      id: row.playerId,
      player: row.player,
      innings: 0,
      wickets: 0,
      runsConceded: 0,
      balls: 0,
      maidens: 0,
      fourWicketHauls: 0,
      fiveWicketHauls: 0,
    };
    total.innings += 1;
    const wickets = row.wickets ?? 0;
    total.wickets += wickets;
    total.runsConceded += row.runsConceded ?? 0;
    total.balls += oversToBalls(row.overs);
    total.maidens += row.maidens ?? 0;
    if (wickets >= 4) total.fourWicketHauls += 1;
    if (wickets >= 5) total.fiveWicketHauls += 1;
    totals.set(row.playerId, total);
  }
  const aggregateRows = [...totals.values()].map((row) => ({
    ...row,
    economy: row.balls ? (row.runsConceded * 6) / row.balls : null,
    strikeRate: row.wickets ? row.balls / row.wickets : null,
    average: row.wickets ? row.runsConceded / row.wickets : null,
    bestFigures: null as string | null,
    match: null,
  }));
  for (const row of inningsRows) {
    const aggregate = aggregateRows.find((item) => item.player.id === row.player.id);
    if (!aggregate || !row.bestFigures) continue;
    const [wickets, runsConceded] = row.bestFigures.split("/").map(Number);
    const [bestWickets, bestRuns] = (aggregate.bestFigures ?? "-/-").split("/").map(Number);
    if (
      wickets > (bestWickets || -1) ||
      (wickets === bestWickets && runsConceded < (bestRuns || Number.MAX_SAFE_INTEGER))
    ) {
      aggregate.bestFigures = row.bestFigures;
    }
  }
  const value = (row: (typeof inningsRows)[number] | (typeof aggregateRows)[number]) => {
    switch (category) {
      case "bowling_best_economy_rates":
      case "bowling_best_economy_rates_innings":
        return row.economy;
      case "bowling_best_strike_rates":
      case "bowling_best_strike_rates_innings":
        return row.strikeRate;
      case "bowling_best_averages":
        return row.average;
      case "bowling_most_runs_conceded_innings":
        return row.runsConceded;
      case "bowling_four_wickets":
        return row.fourWicketHauls;
      case "bowling_five_wickets":
        return row.fiveWicketHauls;
      case "bowling_maidens":
        return row.maidens;
      case "bowling_top_wicket_takers":
        return row.wickets;
      case "bowling_best_bowling_figures":
        return row.wickets;
    }
  };
  const inningsCategory = category.includes("_innings") || category === "bowling_best_bowling_figures";
  const result = (inningsCategory ? inningsRows : aggregateRows).filter((row) => value(row) !== null);
  return result
    .filter((row) => category !== "bowling_best_bowling_figures" || row.wickets > 0)
    .sort((a, b) => {
      if (category === "bowling_best_bowling_figures") {
        const wicketDiff = (b.wickets ?? 0) - (a.wickets ?? 0);
        if (wicketDiff !== 0) return wicketDiff;
        const runsDiff = (a.runsConceded ?? 0) - (b.runsConceded ?? 0);
        if (runsDiff !== 0) return runsDiff;
        return a.player.name.localeCompare(b.player.name);
      }
      const difference = (value(b) ?? -1) - (value(a) ?? -1);
      const orderedDifference =
        category.includes("economy") || category.includes("strike") || category.includes("averages")
          ? -difference
          : difference;
      return orderedDifference || a.player.name.localeCompare(b.player.name);
    })
    .slice(0, 100);
}

export async function teamPerformanceStats(scope: Scope = "all") {
  const [teams, innings, battingRows, bowlingRows, extras, matches] = await Promise.all([
    database().team.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        abbreviation: true,
        logoUrl: true,
        thumbnailUrl: true,
      },
    }),
    database().inning.findMany({
      select: {
        battingTeamId: true,
        scores: true,
        match: { select: { subtitle: true } },
      },
    }),
    database().battingScore.findMany({
      select: {
        runs: true,
        inning: { select: { battingTeamId: true, match: { select: { subtitle: true } } } },
      },
    }),
    database().bowlingFigure.findMany({
      select: {
        runsConceded: true,
        wickets: true,
        inning: { select: { fieldingTeamId: true, match: { select: { subtitle: true } } } },
      },
    }),
    database().inningExtra.findMany({
      select: {
        total: true,
        inning: { select: { fieldingTeamId: true, match: { select: { subtitle: true } } } },
      },
    }),
    database().match.findMany({
      select: { winningTeamId: true, winMargin: true, subtitle: true },
    }),
  ]);
  const stats = new Map(
    teams.map((team) => [
      team.id,
      {
        team,
        runs: 0,
        wickets: 0,
        runsConceded: 0,
        fifties: 0,
        centuries: 0,
        highestScore: null as number | null,
        lowestScore: null as number | null,
        extrasConceded: 0,
        fourWicketHauls: 0,
        fiveWicketHauls: 0,
        highestWinMarginRuns: null as number | null,
        lowestWinMarginRuns: null as number | null,
        highestWinMarginWickets: null as number | null,
        lowestWinMarginWickets: null as number | null,
      },
    ]),
  );
  for (const inning of innings) {
    if (!matchesScope(inning.match.subtitle, scope)) continue;
    const stat = stats.get(inning.battingTeamId);
    const runs = scoreRuns(inning.scores);
    if (stat && runs !== null) {
      stat.runs += runs;
      stat.highestScore = Math.max(stat.highestScore ?? runs, runs);
      stat.lowestScore = Math.min(stat.lowestScore ?? runs, runs);
    }
  }
  for (const row of battingRows) {
    if (!matchesScope(row.inning.match.subtitle, scope)) continue;
    const stat = stats.get(row.inning.battingTeamId);
    const runs = row.runs ?? 0;
    if (!stat) continue;
    if (runs >= 100) stat.centuries += 1;
    else if (runs >= 50) stat.fifties += 1;
  }
  for (const row of bowlingRows) {
    if (!matchesScope(row.inning.match.subtitle, scope)) continue;
    const stat = stats.get(row.inning.fieldingTeamId);
    if (!stat) continue;
    stat.wickets += row.wickets ?? 0;
    stat.runsConceded += row.runsConceded ?? 0;
    if ((row.wickets ?? 0) >= 4) stat.fourWicketHauls += 1;
    if ((row.wickets ?? 0) >= 5) stat.fiveWicketHauls += 1;
  }
  for (const extra of extras) {
    if (!matchesScope(extra.inning.match.subtitle, scope)) continue;
    const stat = stats.get(extra.inning.fieldingTeamId);
    if (stat) stat.extrasConceded += extra.total ?? 0;
  }
  for (const match of matches) {
    if (!matchesScope(match.subtitle, scope) || match.winningTeamId === null) continue;
    const stat = stats.get(match.winningTeamId);
    if (!stat) continue;
    const runs = match.winMargin?.match(/(\d+)\s+runs?/i)?.[1];
    const wickets = match.winMargin?.match(/(\d+)\s+wickets?/i)?.[1];
    if (runs) {
      const value = Number(runs);
      stat.highestWinMarginRuns = Math.max(stat.highestWinMarginRuns ?? value, value);
      stat.lowestWinMarginRuns = Math.min(stat.lowestWinMarginRuns ?? value, value);
    }
    if (wickets) {
      const value = Number(wickets);
      stat.highestWinMarginWickets = Math.max(stat.highestWinMarginWickets ?? value, value);
      stat.lowestWinMarginWickets = Math.min(stat.lowestWinMarginWickets ?? value, value);
    }
  }
  return [...stats.values()].map(({ team, ...stat }) => ({ team, ...stat }));
}

export async function venueStats(scope: Scope = "all") {
  const innings = await database().inning.findMany({
    where: { number: 1 },
    select: {
      scores: true,
      match: {
        select: {
          subtitle: true,
          venue: { select: { id: true, name: true } },
        },
      },
    },
  });
  const totals = new Map<number, { venue: { id: number; name: string }; scores: number[] }>();
  for (const inning of innings) {
    if (!matchesScope(inning.match.subtitle, scope) || !inning.match.venue) continue;
    const score = scoreRuns(inning.scores);
    if (score === null) continue;
    const total = totals.get(inning.match.venue.id) ?? { venue: inning.match.venue, scores: [] };
    total.scores.push(score);
    totals.set(inning.match.venue.id, total);
  }
  return [...totals.values()]
    .map(({ venue, scores }) => ({
      venue,
      matches: scores.length,
      averageFirstInningsScore: scores.reduce((sum, score) => sum + score, 0) / scores.length,
      highestFirstInningsScore: Math.max(...scores),
      lowestFirstInningsScore: Math.min(...scores),
    }))
    .sort((a, b) => b.averageFirstInningsScore - a.averageFirstInningsScore);
}

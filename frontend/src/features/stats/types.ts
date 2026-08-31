export type StatPlayer = {
  id: number;
  name: string;
  shortName: string | null;
  logoUrl: string | null;
  thumbnailUrl: string | null;
};

export type BattingStat = {
  id: number;
  player: StatPlayer;
  innings: number;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number | null;
  average: number | null;
  centuries: number;
  fifties: number;
  highestScore: number;
  match: {
    id: number;
    title: string;
    subtitle: string | null;
  } | null;
};

export type BowlingStat = {
  id: number;
  player: StatPlayer;
  innings: number;
  wickets: number;
  runsConceded: number;
  balls: number;
  maidens: number;
  economy: number | null;
  strikeRate: number | null;
  average: number | null;
  bestFigures: string | null;
  fourWicketHauls: number;
  fiveWicketHauls: number;
  match: {
    id: number;
    title: string;
    subtitle: string | null;
  } | null;
};

export type TeamStat = {
  team: {
    id: number;
    name: string;
    abbreviation: string | null;
    logoUrl: string | null;
    thumbnailUrl: string | null;
  };
  matches: number;
  wins: number;
  losses: number;
  runs: number;
  wickets: number;
  runsConceded: number;
  fifties: number;
  centuries: number;
  highestScore: number | null;
  lowestScore: number | null;
  extrasConceded: number;
  fourWicketHauls: number;
  fiveWicketHauls: number;
  highestWinMarginRuns: number | null;
  lowestWinMarginRuns: number | null;
  highestWinMarginWickets: number | null;
  lowestWinMarginWickets: number | null;
};

export type StatsScope = "league" | "playoffs" | "all";

export type BattingCategory =
  | "batting_most_runs"
  | "batting_most_runs_innings"
  | "batting_highest_strikerate"
  | "batting_highest_strikerate_innings"
  | "batting_highest_average"
  | "batting_most_run100"
  | "batting_most_run50"
  | "batting_most_run6"
  | "batting_most_run6_innings"
  | "batting_most_run4"
  | "batting_most_run4_innings";

export type BowlingCategory =
  | "bowling_top_wicket_takers"
  | "bowling_best_economy_rates"
  | "bowling_best_economy_rates_innings"
  | "bowling_best_bowling_figures"
  | "bowling_best_strike_rates"
  | "bowling_best_strike_rates_innings"
  | "bowling_best_averages"
  | "bowling_most_runs_conceded_innings"
  | "bowling_four_wickets"
  | "bowling_five_wickets"
  | "bowling_maidens";

export type VenueStat = {
  venue: {
    id: number;
    name: string;
  };
  matches: number;
  averageFirstInningsScore: number;
};

export type StatsData = {
  scope: StatsScope;
  battingCategory: BattingCategory;
  bowlingCategory: BowlingCategory;
  batting: BattingStat[];
  battingChart: BattingStat[];
  bowling: BowlingStat[];
  bowlingChart: BowlingStat[];
  teams: TeamStat[];
  venues: VenueStat[];
};

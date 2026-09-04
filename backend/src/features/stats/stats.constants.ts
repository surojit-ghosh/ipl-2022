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

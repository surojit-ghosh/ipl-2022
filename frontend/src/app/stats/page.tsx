import type { Metadata } from "next";

import { fetchStats } from "@/features/stats/api";
import { StatsView } from "@/features/stats/stats-view";
import type { BattingCategory, BowlingCategory, StatsScope } from "@/features/stats/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Stats",
  description: "IPL 2022 batting, bowling, team, and venue analytics with URL-shareable filters.",
};

const SCOPES = new Set<StatsScope>(["league", "playoffs", "all"]);
const BATTING = new Set<BattingCategory>([
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
]);
const BOWLING = new Set<BowlingCategory>([
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
]);

function stringParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function StatsPage({ searchParams }: PageProps<"/stats">) {
  const params = await searchParams;
  const scope = stringParam(params.scope);
  const batting = stringParam(params.batting);
  const bowling = stringParam(params.bowling);
  const initialData = await fetchStats(
    scope && SCOPES.has(scope as StatsScope) ? (scope as StatsScope) : "all",
    batting && BATTING.has(batting as BattingCategory) ? (batting as BattingCategory) : "batting_most_runs",
    bowling && BOWLING.has(bowling as BowlingCategory) ? (bowling as BowlingCategory) : "bowling_top_wicket_takers",
  );
  return <StatsView initialData={initialData} />;
}

import { fetchJson } from "@/lib/api";

import type {
  BattingCategory,
  BattingStat,
  BowlingCategory,
  BowlingStat,
  StatsData,
  StatsScope,
  TeamStat,
} from "./types";

async function get<T>(path: string): Promise<T> {
  return fetchJson<T>(path);
}

export async function fetchStats(
  scope: StatsScope,
  battingCategory: BattingCategory = "batting_most_runs",
  bowlingCategory: BowlingCategory = "bowling_top_wicket_takers",
): Promise<StatsData> {
  const battingRequest = get<{ scope: StatsScope; category: BattingCategory; data: BattingStat[] }>(
    `/api/stats/batting?scope=${scope}&category=${battingCategory}`,
  );
  const battingChartRequest =
    battingCategory === "batting_most_runs"
      ? battingRequest
      : get<{ scope: StatsScope; category: BattingCategory; data: BattingStat[] }>(
          `/api/stats/batting?scope=${scope}&category=batting_most_runs`,
        );
  const bowlingRequest = get<{ scope: StatsScope; category: BowlingCategory; data: BowlingStat[] }>(
    `/api/stats/bowling?scope=${scope}&category=${bowlingCategory}`,
  );
  const bowlingChartRequest =
    bowlingCategory === "bowling_top_wicket_takers"
      ? bowlingRequest
      : get<{ scope: StatsScope; category: BowlingCategory; data: BowlingStat[] }>(
          `/api/stats/bowling?scope=${scope}&category=bowling_top_wicket_takers`,
        );
  const [batting, battingChart, bowling, bowlingChart, teams, venues] = await Promise.all([
    battingRequest,
    battingChartRequest,
    bowlingRequest,
    bowlingChartRequest,
    get<{ data: TeamStat[] }>(`/api/stats/teams?scope=${scope}`),
    get<{ data: StatsData["venues"] }>(`/api/stats/venues?scope=${scope}`),
  ]);

  return {
    scope,
    battingCategory: batting.category,
    bowlingCategory: bowling.category,
    batting: batting.data,
    battingChart: battingChart.data,
    bowling: bowling.data,
    bowlingChart: bowlingChart.data,
    teams: teams.data,
    venues: venues.data,
  };
}

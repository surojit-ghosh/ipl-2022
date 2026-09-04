import { fetchJson } from "@/lib/api";

import type { StandingsResponse } from "./types";

export async function fetchStandings(): Promise<StandingsResponse> {
  return fetchJson<StandingsResponse>("/api/standings");
}

import { apiUrl } from "@/lib/api";

import type { StandingsResponse } from "./types";

export async function fetchStandings(): Promise<StandingsResponse> {
  const response = await fetch(apiUrl("/api/standings"), { cache: "no-store" });
  if (!response.ok) throw new Error("Could not load standings");
  return response.json();
}

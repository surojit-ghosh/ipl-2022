import { ApiError, fetchJson } from "@/lib/api";

import type { PlayerDetail, PlayerSeasonStats, PlayersResponse } from "./types";

export const PLAYERS_PAGE_SIZE = 20;

export async function fetchPlayers(page = 1, query = "", signal?: AbortSignal): Promise<PlayersResponse> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(PLAYERS_PAGE_SIZE),
  });
  if (query.trim()) params.set("q", query.trim());
  return fetchJson<PlayersResponse>(`/api/players?${params}`, { signal });
}

export async function fetchPlayer(id: string): Promise<PlayerDetail | null> {
  try {
    return await fetchJson<PlayerDetail>(`/api/players/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function fetchPlayerSeasonStats(id: string): Promise<PlayerSeasonStats> {
  return fetchJson<PlayerSeasonStats>(`/api/players/${id}/season-stats?scope=all`);
}

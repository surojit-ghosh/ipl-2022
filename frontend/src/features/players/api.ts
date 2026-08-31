import { apiUrl } from "@/lib/api";

import type { PlayerDetail, PlayerSeasonStats, PlayersResponse } from "./types";

export const PLAYERS_PAGE_SIZE = 20;

export async function fetchPlayers(page = 1, query = ""): Promise<PlayersResponse> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(PLAYERS_PAGE_SIZE),
  });
  if (query.trim()) params.set("q", query.trim());
  const response = await fetch(apiUrl(`/api/players?${params}`), { cache: "no-store" });
  if (!response.ok) throw new Error("Could not load players");
  return response.json();
}

export async function fetchPlayer(id: string): Promise<PlayerDetail | null> {
  const response = await fetch(apiUrl(`/api/players/${id}`), { cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Could not load player");
  return response.json();
}

export async function fetchPlayerSeasonStats(id: string): Promise<PlayerSeasonStats> {
  const response = await fetch(apiUrl(`/api/players/${id}/season-stats?scope=all`), {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Could not load player stats");
  return response.json();
}

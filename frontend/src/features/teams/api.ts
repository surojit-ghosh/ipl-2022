import { ApiError, fetchJson } from "@/lib/api";

import type { TeamMatches, TeamProfile, TeamStats, TeamSummary } from "./types";

export async function fetchTeams(): Promise<{ data: TeamSummary[] }> {
  return fetchJson<{ data: TeamSummary[] }>("/api/teams");
}

export async function fetchTeam(id: string): Promise<TeamProfile | null> {
  try {
    return await fetchJson<TeamProfile>(`/api/teams/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function fetchTeamStats(id: string): Promise<TeamStats> {
  return fetchJson<TeamStats>(`/api/teams/${id}/stats?scope=all`);
}

export async function fetchTeamMatches(id: string): Promise<TeamMatches> {
  const params = new URLSearchParams({ team_id: id, page: "1", page_size: "100", order: "desc" });
  return fetchJson<TeamMatches>(`/api/matches?${params}`);
}

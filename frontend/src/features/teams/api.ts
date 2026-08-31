import { apiUrl } from "@/lib/api";

import type { TeamMatches, TeamProfile, TeamStats, TeamSummary } from "./types";

export async function fetchTeams(): Promise<{ data: TeamSummary[] }> {
  const response = await fetch(apiUrl("/api/teams"), { cache: "no-store" });
  if (!response.ok) throw new Error("Could not load teams");
  return response.json();
}

export async function fetchTeam(id: string): Promise<TeamProfile | null> {
  const response = await fetch(apiUrl(`/api/teams/${id}`), { cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Could not load team");
  return response.json();
}

export async function fetchTeamStats(id: string): Promise<TeamStats> {
  const response = await fetch(apiUrl(`/api/teams/${id}/stats?scope=all`), { cache: "no-store" });
  if (!response.ok) throw new Error("Could not load team stats");
  return response.json();
}

export async function fetchTeamMatches(id: string): Promise<TeamMatches> {
  const params = new URLSearchParams({ team_id: id, page: "1", page_size: "100", order: "desc" });
  const response = await fetch(apiUrl(`/api/matches?${params}`), { cache: "no-store" });
  if (!response.ok) throw new Error("Could not load team matches");
  return response.json();
}

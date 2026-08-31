import { apiUrl } from "@/lib/api";

import type {
  CommentaryResponse,
  HistoricalSnapshotResponse,
  MatchDetail,
  ScorecardResponse,
  WagonWheelResponse,
} from "./types";

export async function fetchMatchDetail(id: string): Promise<MatchDetail | null> {
  const response = await fetch(apiUrl(`/api/matches/${id}`), { cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Could not load match");
  return response.json();
}

export async function fetchMatchCommentary(id: string): Promise<CommentaryResponse> {
  const response = await fetch(apiUrl(`/api/matches/${id}/commentary`), { cache: "no-store" });
  if (!response.ok) throw new Error("Could not load commentary");
  return response.json();
}

export async function fetchMatchScorecard(id: string): Promise<ScorecardResponse> {
  const response = await fetch(apiUrl(`/api/matches/${id}/scorecard`), { cache: "no-store" });
  if (!response.ok) throw new Error("Could not load scorecard");
  return response.json();
}

export async function fetchMatchWagonWheel(id: string): Promise<WagonWheelResponse> {
  const response = await fetch(apiUrl(`/api/matches/${id}/wagon-wheel`), { cache: "no-store" });
  if (!response.ok) throw new Error("Could not load wagon wheel");
  return response.json();
}

export async function fetchMatchHistoricalSnapshot(id: string): Promise<HistoricalSnapshotResponse | null> {
  const response = await fetch(apiUrl(`/api/matches/${id}/historical-snapshot`), { cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Could not load historical snapshot");
  return response.json();
}

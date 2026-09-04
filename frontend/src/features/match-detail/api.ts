import { ApiError, fetchJson } from "@/lib/api";

import type {
  CommentaryResponse,
  HistoricalSnapshotResponse,
  MatchDetail,
  ScorecardResponse,
  WagonWheelResponse,
} from "./types";

export async function fetchMatchDetail(id: string): Promise<MatchDetail | null> {
  try {
    return await fetchJson<MatchDetail>(`/api/matches/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function fetchMatchCommentary(id: string): Promise<CommentaryResponse> {
  return fetchJson<CommentaryResponse>(`/api/matches/${id}/commentary`);
}

export async function fetchMatchScorecard(id: string): Promise<ScorecardResponse> {
  return fetchJson<ScorecardResponse>(`/api/matches/${id}/scorecard`);
}

export async function fetchMatchWagonWheel(id: string): Promise<WagonWheelResponse> {
  return fetchJson<WagonWheelResponse>(`/api/matches/${id}/wagon-wheel`);
}

export async function fetchMatchHistoricalSnapshot(id: string): Promise<HistoricalSnapshotResponse | null> {
  try {
    return await fetchJson<HistoricalSnapshotResponse>(`/api/matches/${id}/historical-snapshot`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

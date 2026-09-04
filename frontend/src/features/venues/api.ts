import { ApiError, fetchJson } from "@/lib/api";

import type { VenueDetail, VenueStats, VenueSummary } from "./types";

export async function fetchVenues(): Promise<{ data: VenueSummary[] }> {
  return fetchJson<{ data: VenueSummary[] }>("/api/venues");
}

export async function fetchVenue(id: string): Promise<VenueDetail | null> {
  try {
    return await fetchJson<VenueDetail>(`/api/venues/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function fetchVenueStats(id: string): Promise<VenueStats> {
  return fetchJson<VenueStats>(`/api/venues/${id}/stats`);
}

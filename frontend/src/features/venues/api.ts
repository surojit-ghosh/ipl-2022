import { apiUrl } from "@/lib/api";

import type { VenueDetail, VenueStats, VenueSummary } from "./types";

export async function fetchVenues(): Promise<{ data: VenueSummary[] }> {
  const response = await fetch(apiUrl("/api/venues"), { cache: "no-store" });
  if (!response.ok) throw new Error("Could not load venues");
  return response.json();
}

export async function fetchVenue(id: string): Promise<VenueDetail | null> {
  const response = await fetch(apiUrl(`/api/venues/${id}`), { cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Could not load venue");
  return response.json();
}

export async function fetchVenueStats(id: string): Promise<VenueStats> {
  const response = await fetch(apiUrl(`/api/venues/${id}/stats`), { cache: "no-store" });
  if (!response.ok) throw new Error("Could not load venue stats");
  return response.json();
}

import { fetchJson } from "@/lib/api";

import { HOME_PAGE_SIZE, type MatchListResponse } from "./types";

export async function fetchMatchPage(
  page: number,
  opts: { teamId?: number; venueId?: number; stage?: "league" | "playoffs"; signal?: AbortSignal } = {},
): Promise<MatchListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(HOME_PAGE_SIZE),
    order: "desc",
  });
  if (opts.teamId) params.set("team_id", String(opts.teamId));
  if (opts.venueId) params.set("venue_id", String(opts.venueId));
  if (opts.stage) params.set("stage", opts.stage);

  return fetchJson<MatchListResponse>(`/api/matches?${params}`, { signal: opts.signal });
}

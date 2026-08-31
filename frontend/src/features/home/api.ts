import { apiUrl } from "@/lib/api";

import { HOME_PAGE_SIZE, type MatchListResponse } from "./types";

export async function fetchMatchPage(page: number): Promise<MatchListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(HOME_PAGE_SIZE),
    order: "desc",
  });
  const response = await fetch(apiUrl(`/api/matches?${params}`), { cache: "no-store" });
  if (!response.ok) throw new Error("Could not load matches");
  return response.json();
}

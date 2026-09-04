import type { Metadata } from "next";

import { fetchPlayers } from "@/features/players/api";
import { PlayersView } from "@/features/players/players-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Players",
  description: "Search the IPL 2022 player roster and open detailed batting, bowling, and squad profiles.",
};

export default async function PlayersPage({ searchParams }: PageProps<"/players">) {
  const params = await searchParams;
  const rawQuery = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = rawQuery?.trim() ?? "";
  const initialList = await fetchPlayers(1, query);
  return <PlayersView initialList={initialList} initialQuery={query} />;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { fetchPlayer, fetchPlayerSeasonStats } from "@/features/players/api";
import { PlayerDetailView } from "@/features/players/player-detail-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Player Profile",
  description: "Detailed IPL 2022 player profile with season stats, squad history, and career snapshots.",
};

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const player = await fetchPlayer(id);
  if (!player) notFound();

  const stats = await fetchPlayerSeasonStats(id);
  return <PlayerDetailView player={player} stats={stats} />;
}

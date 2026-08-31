import { notFound } from "next/navigation";

import { fetchPlayer, fetchPlayerSeasonStats } from "@/features/players/api";
import { PlayerDetailView } from "@/features/players/player-detail-view";

export const dynamic = "force-dynamic";

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const player = await fetchPlayer(id);
  if (!player) notFound();

  const stats = await fetchPlayerSeasonStats(id);
  return <PlayerDetailView player={player} stats={stats} />;
}

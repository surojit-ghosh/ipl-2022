import { fetchPlayers } from "@/features/players/api";
import { PlayersView } from "@/features/players/players-view";

export const dynamic = "force-dynamic";

export default async function PlayersPage() {
  const initialList = await fetchPlayers();
  return <PlayersView initialList={initialList} />;
}

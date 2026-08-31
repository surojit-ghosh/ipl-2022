import { fetchStandings } from "@/features/standings/api";
import { StandingsView } from "@/features/standings/standings-view";

export const dynamic = "force-dynamic";

export default async function StandingsPage() {
  const { data } = await fetchStandings();
  return <StandingsView standings={data} />;
}

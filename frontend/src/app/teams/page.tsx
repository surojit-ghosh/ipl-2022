import { fetchTeams } from "@/features/teams/api";
import { TeamsView } from "@/features/teams/teams-view";

export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const { data } = await fetchTeams();
  return <TeamsView teams={data} />;
}

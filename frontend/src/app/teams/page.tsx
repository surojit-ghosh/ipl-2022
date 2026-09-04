import type { Metadata } from "next";

import { fetchTeams } from "@/features/teams/api";
import { TeamsView } from "@/features/teams/teams-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Teams",
  description: "Explore the IPL 2022 franchise directory and open team performance, squad, and match history pages.",
};

export default async function TeamsPage() {
  const { data } = await fetchTeams();
  return <TeamsView teams={data} />;
}

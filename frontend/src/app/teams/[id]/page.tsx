import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { fetchTeam, fetchTeamMatches, fetchTeamStats } from "@/features/teams/api";
import { TeamDetailView } from "@/features/teams/team-detail-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Team Profile",
  description: "Detailed IPL 2022 franchise profile with standings, squad, metrics, and match history.",
};

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const team = await fetchTeam(id);
  if (!team) notFound();

  const [stats, matches] = await Promise.all([fetchTeamStats(id), fetchTeamMatches(id)]);
  return <TeamDetailView team={team} stats={stats} matches={matches} />;
}

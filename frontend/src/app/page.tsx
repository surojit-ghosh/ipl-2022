import type { Metadata } from "next";

import { fetchMatchPage } from "@/features/home/api";
import { HomeView } from "@/features/home/home-view";
import { fetchTeams } from "@/features/teams/api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Match Results",
  description: "Browse IPL 2022 match results by franchise and stage, backed by the Aiko match archive.",
};

function numberParam(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = raw ? Number(raw) : undefined;
  return parsed && Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function stageParam(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "league" || raw === "playoffs" ? raw : undefined;
}

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const teamId = numberParam(params.team);
  const stage = stageParam(params.stage);
  const [initialList, teams] = await Promise.all([
    fetchMatchPage(1, { teamId, stage }),
    fetchTeams(),
  ]);

  return (
    <HomeView
      initialList={initialList}
      initialTeamId={teamId}
      initialStage={stage}
      teams={teams.data}
    />
  );
}

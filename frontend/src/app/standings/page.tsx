import type { Metadata } from "next";

import { fetchStandings } from "@/features/standings/api";
import { StandingsView } from "@/features/standings/standings-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Standings",
  description: "IPL 2022 standings with points, net run rate, run totals, and recent franchise form.",
};

export default async function StandingsPage() {
  const { data } = await fetchStandings();
  return <StandingsView standings={data} />;
}

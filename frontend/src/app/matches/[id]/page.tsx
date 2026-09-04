import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  fetchMatchCommentary,
  fetchMatchDetail,
  fetchMatchHistoricalSnapshot,
  fetchMatchScorecard,
  fetchMatchWagonWheel,
} from "@/features/match-detail/api";
import { MatchDetailView } from "@/features/match-detail/match-detail-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Match Centre",
  description: "IPL 2022 match centre with scorecard, commentary, wagon wheel, and historical snapshot data.",
};

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const match = await fetchMatchDetail(id);
  if (!match) notFound();

  const [commentary, scorecard, wagonWheel, historicalSnapshot] = await Promise.all([
    fetchMatchCommentary(id),
    fetchMatchScorecard(id),
    fetchMatchWagonWheel(id),
    fetchMatchHistoricalSnapshot(id),
  ]);
  return (
    <MatchDetailView
      match={{ ...match, innings: scorecard.innings }}
      commentary={commentary.data}
      wagonWheel={wagonWheel.data}
      historicalSnapshot={historicalSnapshot}
    />
  );
}

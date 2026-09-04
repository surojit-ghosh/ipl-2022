import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { StatCard as SharedStatCard } from "@/components/stat-card";
import { MatchGridCard } from "@/features/home/components/match-grid-card";

import type { VenueDetail, VenueStats } from "./types";

function statValue(value: string | number | null) {
  return value ?? "—";
}

function StatCard({ label, value }: { label: string; value: string | number | null }) {
  return <SharedStatCard label={label} value={statValue(value)} />;
}

export function VenueDetailView({ venue, stats }: { venue: VenueDetail; stats: VenueStats }) {
  return (
    <div className="space-y-8">
      <Link
        href="/venues"
        className="inline-block text-sm text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Back to venues
      </Link>

      <header className="rounded-xl border border-border bg-card px-5 py-6 sm:px-8">
        <p className="text-sm text-muted-foreground">{[venue.location, venue.country].filter(Boolean).join(" · ")}</p>
        <h1 className="mt-1 wrap-break-word font-heading text-4xl text-foreground">{venue.name}</h1>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Matches" value={stats.matches} />
        <StatCard
          label="Average first innings"
          value={stats.averageFirstInningsScore === null ? null : stats.averageFirstInningsScore.toFixed(1)}
        />
        <StatCard label="Highest first innings" value={stats.highestFirstInningsScore} />
        <StatCard label="Lowest first innings" value={stats.lowestFirstInningsScore} />
        <StatCard label="Listed matches" value={venue.matches.length} />
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Venue record</p>
            <h2 className="font-heading text-2xl text-foreground">Matches</h2>
          </div>
          <span className="text-sm text-text-secondary">{venue.matches.length} matches</span>
        </div>
        {venue.matches.length ? (
          <div className="aiko-match-list space-y-3">
            {venue.matches.map((match) => <MatchGridCard key={match.id} match={match} />)}
          </div>
        ) : (
          <EmptyState title="No matches found" description="This venue has no linked IPL 2022 match records." />
        )}
      </section>
    </div>
  );
}

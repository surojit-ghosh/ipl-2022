"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/page-header";
import { fetchVenues } from "./api";
import type { VenueSummary } from "./types";

function venueLocation(venue: VenueSummary) {
  return [venue.location, venue.country].filter(Boolean).join(", ") || "Location unknown";
}

function VenueCard({ venue }: { venue: VenueSummary }) {
  return (
    <Link
      href={`/venues/${venue.id}`}
      className="group rounded-lg border border-border bg-card px-5 py-5 transition-[background-color,border-color,transform] duration-120 ease-out hover:-translate-y-px hover:border-border-strong hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <h2 className="wrap-break-word font-heading text-2xl text-foreground">{venue.name}</h2>
      <p className="mt-1 text-sm text-text-secondary">{venueLocation(venue)}</p>
      <p className="mt-5 flex items-baseline justify-between gap-4 border-t border-border pt-3 text-sm text-text-secondary">
        <span>Matches</span>
        <span className="font-mono font-medium tabular-nums text-foreground">{venue._count.matches}</span>
      </p>
    </Link>
  );
}

export function VenuesView({ venues: initialVenues }: { venues: VenueSummary[] }) {
  const { data: venues = initialVenues } = useQuery({
    queryKey: ["venues"],
    queryFn: async () => {
      const res = await fetchVenues();
      return res.data;
    },
    initialData: initialVenues,
  });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="IPL 2022 · Stadium Telemetry"
        title="IPL 2022 Venues"
        subtitle={`${venues.length} official host stadiums across India`}
      />

      {venues.length ? (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {venues.map((venue) => <VenueCard key={venue.id} venue={venue} />)}
        </section>
      ) : (
        <p className="rounded-lg border border-dashed border-border px-4 py-8 text-sm text-text-secondary">
          No venues available.
        </p>
      )}
    </div>
  );
}

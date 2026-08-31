import Link from "next/link";

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

export function VenuesView({ venues }: { venues: VenueSummary[] }) {
  return (
    <div className="space-y-8">
      <header className="border-b border-border pb-6">
        <p className="mb-1 text-sm text-muted-foreground">Venue directory</p>
        <h1 className="font-heading text-3xl text-foreground">IPL 2022 venues</h1>
        <p className="mt-2 text-sm text-text-secondary">{venues.length} venues</p>
      </header>

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

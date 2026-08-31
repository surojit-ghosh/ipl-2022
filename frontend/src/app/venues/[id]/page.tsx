import { notFound } from "next/navigation";

import { fetchVenue, fetchVenueStats } from "@/features/venues/api";
import { VenueDetailView } from "@/features/venues/venue-detail-view";

export const dynamic = "force-dynamic";

export default async function VenuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const venue = await fetchVenue(id);
  if (!venue) notFound();

  const stats = await fetchVenueStats(id);
  return <VenueDetailView venue={venue} stats={stats} />;
}

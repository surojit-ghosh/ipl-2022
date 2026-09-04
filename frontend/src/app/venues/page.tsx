import type { Metadata } from "next";

import { fetchVenues } from "@/features/venues/api";
import { VenuesView } from "@/features/venues/venues-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Venues",
  description: "Browse IPL 2022 host venues and open stadium scoring profiles and match records.",
};

export default async function VenuesPage() {
  const { data } = await fetchVenues();
  return <VenuesView venues={data} />;
}

import { fetchVenues } from "@/features/venues/api";
import { VenuesView } from "@/features/venues/venues-view";

export const dynamic = "force-dynamic";

export default async function VenuesPage() {
  const { data } = await fetchVenues();
  return <VenuesView venues={data} />;
}

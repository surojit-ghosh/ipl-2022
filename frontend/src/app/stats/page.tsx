import { fetchStats } from "@/features/stats/api";
import { StatsView } from "@/features/stats/stats-view";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const initialData = await fetchStats("all");
  return <StatsView initialData={initialData} />;
}

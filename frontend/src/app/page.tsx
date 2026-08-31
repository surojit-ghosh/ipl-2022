import { fetchMatchPage } from "@/features/home/api";
import { HomeView } from "@/features/home/home-view";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const initialList = await fetchMatchPage(1);
  return <HomeView initialList={initialList} />;
}

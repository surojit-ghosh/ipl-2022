import { database } from "@/lib/db";

export async function getStandings() {
  return database().standing.findMany({
    orderBy: { position: "asc" },
    include: { team: true, season: true },
  });
}

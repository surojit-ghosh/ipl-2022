import { database } from "@/lib/db";
import { matchesScope, type Scope } from "@/lib/scope";

export async function listTeams() {
  return database().team.findMany({ orderBy: { name: "asc" } });
}

export async function findTeam(id: number) {
  const team = await database().team.findUnique({
    where: { id },
    include: {
      seasonTeams: true,
      squadMembers: { include: { player: true, season: true } },
      standings: { include: { season: true } },
    },
  });
  if (!team) return null;
  const { squadMembers, ...teamData } = team;
  return { ...teamData, seasonSquadMembers: squadMembers };
}

export async function teamExists(id: number) {
  const team = await database().team.findUnique({ where: { id }, select: { id: true } });
  return team !== null;
}

export async function teamStats(teamId: number, scope: Scope) {
  const [matches, snapshots] = await Promise.all([
    database().match.findMany({
      where: { OR: [{ teamAId: teamId }, { teamBId: teamId }] },
      select: { winningTeamId: true, subtitle: true },
    }),
    database().teamStatSnapshot.findMany({
      where: { teamId },
      orderBy: [{ seasonId: "asc" }, { metric: "asc" }],
      include: { season: { select: { year: true, slug: true } } },
    }),
  ]);
  const scopedMatches = matches.filter((match) => matchesScope(match.subtitle, scope));
  return {
    teamId,
    scope,
    matches: scopedMatches.length,
    wins: scopedMatches.filter((match) => match.winningTeamId === teamId).length,
    losses: scopedMatches.filter(
      (match) => match.winningTeamId !== null && match.winningTeamId !== teamId,
    ).length,
    snapshots,
  };
}

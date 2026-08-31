import { enumQuery } from "@/lib/query";

export type Scope = "league" | "playoffs" | "all";

export function queryScope(value: unknown): Scope {
  return enumQuery(value, ["league", "playoffs", "all"] as const, "scope", "all");
}

export function matchesScope(subtitle: string | null, scope: Scope): boolean {
  if (scope === "all") return true;
  const isLeague = !/(qualifier|eliminator|final)/i.test(subtitle ?? "");
  return scope === "league" ? isLeague : !isLeague;
}

export function oversToBalls(value: string | null): number {
  if (!value) return 0;
  const [overs, balls] = value.split(".").map(Number);
  return (overs || 0) * 6 + (balls || 0);
}

export function scoreRuns(value: string | null): number | null {
  const runs = value?.match(/^\d+/)?.[0];
  return runs ? Number(runs) : null;
}

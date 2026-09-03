import Link from "next/link";
import { cn } from "@/lib/utils";
import { TeamCrest } from "./team-crest";
import type { MatchCard } from "../types";

function dateLabel(startAt: string | null) {
  if (!startAt) return "Date TBC";
  return new Date(startAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

function inningForTeam(match: MatchCard, teamId: number) {
  return match.innings.find((inn) => inn.battingTeamId === teamId);
}

function stageLabel(matchNumber: string | null): string {
  if (!matchNumber) return "";
  const n = parseInt(matchNumber, 10);
  if (n === 74) return "Final";
  if (n === 73) return "Qualifier 2";
  if (n === 72) return "Eliminator";
  if (n === 71) return "Qualifier 1";
  return `Match ${matchNumber}`;
}

function isPlayoff(matchNumber: string | null): boolean {
  const n = matchNumber ? parseInt(matchNumber, 10) : 0;
  return n >= 71;
}

interface MatchGridCardProps {
  match: MatchCard;
  featured?: boolean;
}

export function MatchGridCard({ match, featured }: MatchGridCardProps) {
  const result = match.statusNote ?? match.statusText;
  const playoff = isPlayoff(match.matchNumber);

  return (
    <Link
      href={`/matches/${match.id}`}
      aria-label={`Open ${match.shortTitle ?? match.title}`}
      className={cn(
        "group relative flex flex-col rounded-lg border border-border bg-card transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        featured
          ? "border-primary/30 hover:border-primary/60"
          : "hover:border-primary/30 hover:bg-card/80",
        "aiko-match-hero border-t-2 border-t-primary",
      )}
    >
      <div className="flex flex-col gap-3 p-4">
        {/* Card header */}
        <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              {playoff && (
                <span className="rounded bg-secondary/20 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-secondary">
                  {stageLabel(match.matchNumber)}
                </span>
              )}
              {!playoff && match.matchNumber && (
                <span className="font-mono text-[11px] text-muted-foreground">
                  M{match.matchNumber}
                </span>
              )}
            </div>
            {match.venue && (
              <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                {match.venue.name}
              </p>
            )}
          </div>
          <time className="shrink-0 font-mono text-[11px] text-muted-foreground">
            {dateLabel(match.startAt)}
          </time>
        </div>

        {/* Teams + scores */}
        <div className="flex flex-col gap-2.5">
          {[match.teamA, match.teamB].map((team) => {
            const inn = inningForTeam(match, team.id);
            const won = match.winningTeam?.id === team.id;
            return (
              <div key={team.id} className="flex items-center gap-3">
                <TeamCrest team={team} size="sm" />
                <span
                  className={cn(
                    "min-w-0 flex-1 truncate text-sm",
                    won ? "font-semibold text-foreground" : "text-muted-foreground",
                  )}
                >
                  {team.name}
                </span>
                {inn ? (
                  <div className="flex items-baseline gap-1.5 shrink-0">
                    <span
                      className={cn(
                        "font-mono text-base font-semibold tabular-nums",
                        won ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {inn.scores}
                    </span>
                    {inn.overs && (
                      <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                        ({inn.overs})
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="font-mono text-sm text-muted-foreground">—</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Result strip */}
        {result && (
          <p className="border-t border-border pt-2.5 font-sans text-xs text-muted-foreground">
            {result}
          </p>
        )}
      </div>
    </Link>
  );
}

export function MatchGridCardSkeleton() {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card/60 p-4">
      {/* Top accent bar placeholder */}
      <div className="h-[2px] w-full rounded-t-lg bg-border/40" />

      <div className="flex flex-col gap-3 pt-1">
        {/* Card header */}
        <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
          <div className="space-y-1.5">
            <div className="h-3 w-16 animate-pulse rounded bg-muted/80" />
            <div className="h-2.5 w-28 animate-pulse rounded bg-muted/60" />
          </div>
          <div className="h-3 w-20 animate-pulse rounded bg-muted/60" />
        </div>

        {/* Teams + scores */}
        <div className="flex flex-col gap-3 py-1">
          <div className="flex items-center gap-3">
            <div className="size-6 shrink-0 animate-pulse rounded-md bg-muted/80" />
            <div className="h-4 flex-1 animate-pulse rounded bg-muted/70" />
            <div className="h-4 w-12 animate-pulse rounded bg-muted/80" />
          </div>
          <div className="flex items-center gap-3">
            <div className="size-6 shrink-0 animate-pulse rounded-md bg-muted/80" />
            <div className="h-4 flex-1 animate-pulse rounded bg-muted/70" />
            <div className="h-4 w-12 animate-pulse rounded bg-muted/80" />
          </div>
        </div>

        {/* Result strip */}
        <div className="border-t border-border pt-2.5">
          <div className="h-3 w-3/4 animate-pulse rounded bg-muted/60" />
        </div>
      </div>
    </div>
  );
}
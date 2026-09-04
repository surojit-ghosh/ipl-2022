"use client";

import { cn } from "@/lib/utils";
import type { TeamSummary } from "@/features/teams/types";

interface FilterBarProps {
  teamId: number | undefined;
  stage: "league" | "playoffs" | undefined;
  totalItems: number;
  teams: TeamSummary[];
  onTeamChange: (id: number | undefined) => void;
  onStageChange: (stage: "league" | "playoffs" | undefined) => void;
}

export function FilterBar({
  teamId,
  stage,
  totalItems,
  teams,
  onTeamChange,
  onStageChange,
}: FilterBarProps) {
  return (
    <div className="aiko-panel flex flex-wrap items-center justify-between gap-3 rounded-lg p-2.5 sm:px-3.5">
      <div className="flex max-w-full items-center gap-1.5 overflow-x-auto py-0.5" role="group" aria-label="Filter matches by team">
        <span className="mr-1 shrink-0 font-mono text-[10px] font-medium text-muted-foreground">
          Team:
        </span>
        <button
          type="button"
          onClick={() => onTeamChange(undefined)}
          aria-pressed={!teamId}
          className={cn(
            "shrink-0 rounded px-2.5 py-1 font-mono text-xs font-semibold transition-[background-color,color,transform] duration-[120ms] ease-[var(--ease-out)] active:scale-[0.98]",
            !teamId
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
          )}
        >
          ALL
        </button>
        {teams.map((team) => {
          const abbr = team.abbreviation ?? team.name.slice(0, 3).toUpperCase();
          return (
            <button
              key={team.id}
              type="button"
              onClick={() => onTeamChange(teamId === team.id ? undefined : team.id)}
              aria-pressed={teamId === team.id}
              title={team.name}
              className={cn(
                "shrink-0 rounded px-2.5 py-1 font-mono text-xs font-semibold transition-[background-color,color,transform] duration-[120ms] ease-[var(--ease-out)] active:scale-[0.98]",
                teamId === team.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
              )}
            >
              {abbr}
            </button>
          );
        })}
      </div>

      <div className="flex max-w-full items-center gap-1.5 overflow-x-auto py-0.5" role="group" aria-label="Filter matches by stage">
        <span className="mr-1 shrink-0 font-mono text-[10px] font-medium text-muted-foreground">
          Stage:
        </span>
        {[
          { id: undefined, label: "ALL" },
          { id: "league" as const, label: "League" },
          { id: "playoffs" as const, label: "Playoffs" },
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => onStageChange(item.id)}
            aria-pressed={stage === item.id}
            className={cn(
              "shrink-0 rounded px-2.5 py-1 font-mono text-xs font-semibold transition-[background-color,color,transform] duration-[120ms] ease-[var(--ease-out)] active:scale-[0.98]",
              stage === item.id
                ? "bg-secondary text-secondary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
        {totalItems} match{totalItems !== 1 ? "es" : ""}
      </span>
    </div>
  );
}

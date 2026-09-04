"use client";

import { cn } from "@/lib/utils";

export interface FranchiseEntry {
  id: number;
  abbr: string;
  name: string;
}

interface FilterBarProps {
  teamId: number | undefined;
  totalItems: number;
  teams: FranchiseEntry[];
  onTeamChange: (id: number | undefined) => void;
}

export function FilterBar({
  teamId,
  totalItems,
  teams,
  onTeamChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-2.5 sm:px-3.5">
      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-muted-foreground mr-1">
          Team:
        </span>
        <button
          type="button"
          onClick={() => onTeamChange(undefined)}
          className={cn(
            "shrink-0 rounded px-2.5 py-1 font-mono text-xs font-semibold transition-all duration-120",
            !teamId
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
          )}
        >
          ALL
        </button>
        {teams.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onTeamChange(teamId === f.id ? undefined : f.id)}
            title={f.name}
            className={cn(
              "shrink-0 rounded px-2.5 py-1 font-mono text-xs font-semibold transition-all duration-120",
              teamId === f.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
            )}
          >
            {f.abbr}
          </button>
        ))}
      </div>

      <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
        {totalItems} match{totalItems !== 1 ? "es" : ""}
      </span>
    </div>
  );
}
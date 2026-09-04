"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/page-header";
import { fetchMatchPage } from "./api";
import { FilterBar, type FranchiseEntry } from "./components/filter-bar";
import { MatchGridCard, MatchGridCardSkeleton } from "./components/match-grid-card";
import type { MatchCard, MatchListResponse } from "./types";

// ─── Grid ────────────────────────────────────────────────────────────────────

function MatchGrid({ matches }: { matches: MatchCard[] }) {
  return (
    <div className="aiko-match-list grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {matches.map((m, i) => (
        <MatchGridCard key={m.id} match={m} featured={i === 0} />
      ))}
    </div>
  );
}

// ─── HomeView ────────────────────────────────────────────────────────────────

export function HomeView({ initialList }: { initialList: MatchListResponse }) {
  // Team Filter
  const [teamId, setTeamId] = useState<number | undefined>(undefined);

  // Build franchise list from the initial match data (deduplicated)
  const [teams] = useState<FranchiseEntry[]>(() => {
    const seen = new Map<number, FranchiseEntry>();
    for (const m of initialList.data) {
      for (const t of [m.teamA, m.teamB]) {
        if (!seen.has(t.id)) {
          seen.set(t.id, {
            id: t.id,
            abbr: t.abbreviation ?? t.name.slice(0, 3).toUpperCase(),
            name: t.name,
          });
        }
      }
    }
    return [...seen.values()].sort((a, b) => a.abbr.localeCompare(b.abbr));
  });

  // ── TanStack Infinite Query ─────────────────────────────────────────────
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["matches", { teamId }],
    queryFn: ({ pageParam = 1 }) => fetchMatchPage(pageParam, { teamId }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.total_pages
        ? lastPage.meta.page + 1
        : undefined,
    initialData: !teamId
      ? {
          pages: [initialList],
          pageParams: [1],
        }
      : undefined,
  });

  const matches = data?.pages.flatMap((page) => page.data) ?? [];
  const totalItems = data?.pages[0]?.meta.total_items ?? initialList.meta.total_items;

  // ── Sentinel IntersectionObserver ───────────────────────────────────────
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasNextPage || isError) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && !isFetchingNextPage) {
        void fetchNextPage();
      }
    });
    obs.observe(node);
    return () => obs.disconnect();
  }, [hasNextPage, isError, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="space-y-6">
      {/* Shared Page Header */}
      <PageHeader
        title="Match Results"
        subtitle={`${totalItems} matches across 10 franchises · Ball-by-ball telemetry`}
      />

      {/* Team Filter Bar */}
      <FilterBar
        teamId={teamId}
        totalItems={totalItems}
        teams={teams}
        onTeamChange={setTeamId}
      />

      {/* Match Grid & Skeletons */}
      {isLoading && matches.length === 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <MatchGridCardSkeleton key={i} />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center">
          <p className="font-sans text-sm text-muted-foreground">
            No matches found for this team.
          </p>
        </div>
      ) : (
        <>
          <MatchGrid matches={matches} />
          {isFetchingNextPage && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <MatchGridCardSkeleton key={`loading-${i}`} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Error state */}
      {isError && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 py-4 text-center">
          <p className="font-sans text-sm text-destructive" role="alert">
            {error instanceof Error ? error.message : "Could not load matches"}{" "}
            <button
              type="button"
              className="ml-2 font-semibold text-primary underline underline-offset-4 hover:opacity-80"
              onClick={() => void fetchNextPage()}
            >
              Try again
            </button>
          </p>
        </div>
      )}

      {/* Infinite scroll loader / sentinel */}
      {hasNextPage && !isError && (
        <div
          ref={sentinelRef}
          className="min-h-16 py-4 flex items-center justify-center"
          aria-busy={isFetchingNextPage}
          aria-label={isFetchingNextPage ? "Loading more matches" : undefined}
        >
          {isFetchingNextPage && (
            <div className="flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2 shadow-sm">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Loading telemetry data…
              </span>
            </div>
          )}
        </div>
      )}

      {/* End of list */}
      {!hasNextPage && matches.length > 0 && (
        <div className="mt-8 flex flex-col items-center justify-center gap-1.5 border-t border-border/60 py-8 text-center">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            No more matches
          </p>
          <p className="font-mono text-[11px] text-muted-foreground/70">
            All {totalItems} matches in IPL 2022 loaded ·{" "}
            <Link href="/standings" className="text-primary hover:underline underline-offset-2">
              View league standings →
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}

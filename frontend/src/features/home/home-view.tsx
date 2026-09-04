"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";

import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { PageHeader } from "@/components/page-header";
import { fetchMatchPage } from "./api";
import { FilterBar } from "./components/filter-bar";
import { MatchGridCard, MatchGridCardSkeleton } from "./components/match-grid-card";
import type { MatchCard, MatchListResponse } from "./types";
import type { TeamSummary } from "@/features/teams/types";

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

export function HomeView({
  initialList,
  initialTeamId,
  initialStage,
  teams,
}: {
  initialList: MatchListResponse;
  initialTeamId?: number;
  initialStage?: "league" | "playoffs";
  teams: TeamSummary[];
}) {
  const pathname = usePathname();
  const [teamId, setTeamId] = useState<number | undefined>(initialTeamId);
  const [stage, setStage] = useState<"league" | "playoffs" | undefined>(initialStage);

  const updateUrl = (nextTeamId: number | undefined, nextStage: "league" | "playoffs" | undefined) => {
    const params = new URLSearchParams(window.location.search);
    if (nextTeamId) params.set("team", String(nextTeamId));
    else params.delete("team");
    if (nextStage) params.set("stage", nextStage);
    else params.delete("stage");
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
  };

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
    queryKey: ["matches", { teamId, stage }],
    queryFn: ({ pageParam = 1, signal }) => fetchMatchPage(pageParam, { teamId, stage, signal }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.total_pages
        ? lastPage.meta.page + 1
        : undefined,
    initialData: teamId === initialTeamId && stage === initialStage
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
        stage={stage}
        totalItems={totalItems}
        teams={teams}
        onTeamChange={(id) => {
          setTeamId(id);
          updateUrl(id, stage);
        }}
        onStageChange={(value) => {
          setStage(value);
          updateUrl(teamId, value);
        }}
      />

      {/* Match Grid & Skeletons */}
      {isLoading && matches.length === 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <MatchGridCardSkeleton key={i} />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <EmptyState
          title="No matches found"
          description="The selected team and stage combination has no archived IPL 2022 matches."
        />
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
        <ErrorState
          title="Match request failed"
          description={
            <>
              {error instanceof Error ? error.message : "Could not load matches"}{" "}
              <button
                type="button"
                className="font-semibold text-primary underline underline-offset-4 hover:opacity-80"
                onClick={() => void fetchNextPage()}
              >
                Try again
              </button>
            </>
          }
        />
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
                Loading telemetry data...
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
            All {totalItems} matches in IPL 2022 loaded{" "}
            <Link href="/standings" className="text-primary hover:underline underline-offset-2">
              View league standings
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}

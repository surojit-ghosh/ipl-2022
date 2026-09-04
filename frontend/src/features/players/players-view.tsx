"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";

import { EntityImage } from "@/components/entity-image";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { fetchPlayers } from "./api";
import type { Player, PlayersResponse } from "./types";

function PlayerImage({ player }: { player: Player }) {
  const image = player.logoUrl ?? player.thumbnailUrl;
  return (
    <EntityImage
      kind="player"
      src={image}
      alt=""
      width={64}
      height={64}
      className="size-16 rounded-full"
      imageClassName="object-cover"
    />
  );
}

function PlayerCard({ player }: { player: Player }) {
  const details = [player.playingRole, player.country ?? player.nationality].filter(Boolean).join(" · ");
  return (
    <Link
      href={`/players/${player.id}`}
      className="flex min-w-0 items-center gap-4 rounded-lg border border-border bg-card px-4 py-4 transition-[background-color,border-color,transform] duration-[120ms] ease-[var(--ease-out)] hover:-translate-y-px hover:border-border-strong hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <PlayerImage player={player} />
      <div className="min-w-0">
        <h2 className="wrap-break-word font-heading text-xl leading-tight text-foreground">{player.name}</h2>
        <p className="mt-1 wrap-break-word text-sm text-text-secondary">{details || "Player"}</p>
      </div>
    </Link>
  );
}

export function PlayersView({
  initialList,
  initialQuery,
}: {
  initialList: PlayersResponse;
  initialQuery: string;
}) {
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  // ── Debounce search input ───────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
      const params = new URLSearchParams(window.location.search);
      if (query.trim()) params.set("q", query.trim());
      else params.delete("q");
      const qs = params.toString();
      window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
    }, 250);
    return () => clearTimeout(timer);
  }, [pathname, query]);

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
    queryKey: ["players", { query: debouncedQuery }],
    queryFn: ({ pageParam = 1, signal }) => fetchPlayers(pageParam, debouncedQuery, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.total_pages
        ? lastPage.meta.page + 1
        : undefined,
    initialData: debouncedQuery === initialQuery
      ? {
          pages: [initialList],
          pageParams: [1],
        }
      : undefined,
  });

  const players = data?.pages.flatMap((page) => page.data) ?? [];
  const totalItems = data?.pages[0]?.meta.total_items ?? initialList.meta.total_items;

  // ── Sentinel IntersectionObserver ───────────────────────────────────────
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasNextPage || isError) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && !isFetchingNextPage) {
        void fetchNextPage();
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isError, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="IPL 2022 · Player Roster"
        title="IPL 2022 Players"
        subtitle={`${totalItems} players registered across all squads`}
      >
        <label className="w-full sm:w-72">
          <span className="sr-only">Search players</span>
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onInput={(event) => setQuery(event.currentTarget.value)}
            placeholder="Search players"
          />
        </label>
      </PageHeader>

      {isLoading && players.length === 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[repeat(2,minmax(0,1fr))] lg:grid-cols-[repeat(3,minmax(0,1fr))]">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-lg border border-border bg-card/60 p-4"
            >
              <div className="size-16 shrink-0 animate-pulse rounded-full bg-muted/80" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-muted/80" />
                <div className="h-3 w-20 animate-pulse rounded bg-muted/60" />
              </div>
            </div>
          ))}
        </div>
      ) : players.length === 0 ? (
        <EmptyState
          title="No players found"
          description={debouncedQuery ? `No player names match "${debouncedQuery}".` : "No player records are available."}
        />
      ) : (
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-[repeat(2,minmax(0,1fr))] lg:grid-cols-[repeat(3,minmax(0,1fr))]">
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </section>
      )}

      {isError && (
        <ErrorState
          title="Player request failed"
          description={
            <>
              {error instanceof Error ? error.message : "Could not load players"}.{" "}
              <button
                type="button"
                className="text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
                onClick={() => void fetchNextPage()}
              >
                Try again
              </button>
            </>
          }
        />
      )}

      {hasNextPage && !isError && (
        <div
          ref={sentinelRef}
          className="h-12 flex items-center justify-center"
          aria-busy={isFetchingNextPage}
          aria-label={isFetchingNextPage ? "Loading more players" : undefined}
        >
          {isFetchingNextPage && (
            <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
              <span className="aiko-live-pulse inline-block size-1.5 rounded-full bg-primary" />
              Loading players...
            </div>
          )}
        </div>
      )}
    </div>
  );
}


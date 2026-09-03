"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/page-header";
import { fetchPlayers } from "./api";
import type { Player, PlayersResponse } from "./types";

function PlayerImage({ player }: { player: Player }) {
  const [failed, setFailed] = useState(false);
  const image = player.logoUrl ?? player.thumbnailUrl;
  const initials = player.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span className="inline-flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-lg font-medium text-muted-foreground">
      {image && !failed ? (
        <Image
          src={image}
          alt=""
          width={64}
          height={64}
          unoptimized
          loading="lazy"
          decoding="async"
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        initials || "—"
      )}
    </span>
  );
}

function PlayerCard({ player }: { player: Player }) {
  const details = [player.playingRole, player.country ?? player.nationality].filter(Boolean).join(" · ");
  return (
    <Link
      href={`/players/${player.id}`}
      className="flex min-w-0 items-center gap-4 rounded-lg border border-border bg-card px-4 py-4 transition-[background-color,border-color,transform] duration-120 ease-out hover:-translate-y-px hover:border-border-strong hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
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
}: {
  initialList: PlayersResponse;
}) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // ── Debounce search input ───────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

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
    queryFn: ({ pageParam = 1 }) => fetchPlayers(pageParam, debouncedQuery),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.total_pages
        ? lastPage.meta.page + 1
        : undefined,
    initialData: !debouncedQuery
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
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search players…"
            className="min-h-10 w-full rounded-full border border-border bg-card px-4 font-sans text-sm text-foreground outline-none transition-[border-color,box-shadow] duration-120 ease-out placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
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
        <p className="rounded-lg border border-dashed border-border px-4 py-8 text-sm text-text-secondary">
          {debouncedQuery ? `No players match “${debouncedQuery}”.` : "No players available."}
        </p>
      ) : (
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-[repeat(2,minmax(0,1fr))] lg:grid-cols-[repeat(3,minmax(0,1fr))]">
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </section>
      )}

      {isError && (
        <p className="text-sm text-destructive" role="alert">
          {error instanceof Error ? error.message : "Could not load players"}.{" "}
          <button
            type="button"
            className="underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
            onClick={() => void fetchNextPage()}
          >
            Try again
          </button>
        </p>
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
              Loading players…
            </div>
          )}
        </div>
      )}
    </div>
  );
}


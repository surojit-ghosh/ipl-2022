"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

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
  const [players, setPlayers] = useState(initialList.data);
  const [page, setPage] = useState(initialList.meta.page);
  const [totalItems, setTotalItems] = useState(initialList.meta.total_items);
  const [totalPages, setTotalPages] = useState(initialList.meta.total_pages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const requestRef = useRef(0);
  const firstQueryRef = useRef(true);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || page >= totalPages) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    const request = requestRef.current;
    try {
      const next = await fetchPlayers(page + 1, query);
      if (request !== requestRef.current) return;
      setPlayers((current) => {
        const seen = new Set(current.map((player) => player.id));
        return [...current, ...next.data.filter((player) => !seen.has(player.id))];
      });
      setPage(next.meta.page);
      setTotalItems(next.meta.total_items);
      setTotalPages(next.meta.total_pages);
    } catch (cause) {
      if (request === requestRef.current) {
        setError(cause instanceof Error ? cause.message : "Could not load players");
      }
    } finally {
      if (request === requestRef.current) {
        loadingRef.current = false;
        setLoading(false);
      }
    }
  }, [page, query, totalPages]);

  useEffect(() => {
    if (firstQueryRef.current) {
      firstQueryRef.current = false;
      return;
    }
    const request = ++requestRef.current;
    loadingRef.current = false;
    setLoading(false);
    setError(null);
    setPlayers([]);
    setPage(1);
    setTotalItems(0);
    setTotalPages(0);
    const timeout = window.setTimeout(async () => {
      loadingRef.current = true;
      setLoading(true);
      try {
        const next = await fetchPlayers(1, query);
        if (request !== requestRef.current) return;
        setPlayers(next.data);
        setPage(next.meta.page);
        setTotalItems(next.meta.total_items);
        setTotalPages(next.meta.total_pages);
      } catch (cause) {
        if (request === requestRef.current) {
          setError(cause instanceof Error ? cause.message : "Could not load players");
        }
      } finally {
        if (request === requestRef.current) {
          loadingRef.current = false;
          setLoading(false);
        }
      }
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [query, retryKey]);

  const hasMore = page < totalPages;

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || error) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) void loadMore();
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [error, hasMore, loadMore, players.length]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-sm text-muted-foreground">Player directory</p>
          <h1 className="font-heading text-3xl text-foreground">IPL 2022 players</h1>
          <p className="mt-2 text-sm text-text-secondary">{totalItems} players shown</p>
        </div>
        <label className="w-full sm:max-w-xs">
          <span className="sr-only">Search players</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search players"
            className="min-h-11 w-full rounded-full border border-border bg-card px-4 text-base text-foreground outline-none transition-[border-color,box-shadow] duration-120 ease-out placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          />
        </label>
      </header>

      {players.length === 0 && !query.trim() && !loading ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-8 text-sm text-text-secondary">
          No players available.
        </p>
      ) : players.length === 0 && !loading ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-8 text-sm text-text-secondary">
          No players match “{query}”.
        </p>
      ) : players.length ? (
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-[repeat(2,minmax(0,1fr))] lg:grid-cols-[repeat(3,minmax(0,1fr))]">
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </section>
      ) : null}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}.{" "}
          <button
            type="button"
            className="underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
            onClick={() => {
              if (players.length) void loadMore();
              else setRetryKey((current) => current + 1);
            }}
          >
            Try again
          </button>
        </p>
      ) : null}

      {hasMore && !error ? (
        <div
          ref={sentinelRef}
          className="h-12"
          aria-busy={loading}
          aria-label={loading ? "Loading more players" : undefined}
        >
          {loading ? <p className="text-center text-sm text-muted-foreground">Loading</p> : null}
        </div>
      ) : null}
    </div>
  );
}

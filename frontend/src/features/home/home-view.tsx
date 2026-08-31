"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { SectionTitle } from "@/components/section-title";
import { cn } from "@/lib/utils";

import { fetchMatchPage } from "./api";
import type { MatchCard, MatchListResponse } from "./types";

function logoSrc(team: MatchCard["teamA"]) {
  return team.logoUrl ?? team.thumbnailUrl;
}

function TeamLogo({ team, large }: { team: MatchCard["teamA"]; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  const src = logoSrc(team);
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground",
        large ? "size-10" : "size-8",
      )}
    >
      {src && !failed ? (
        <Image
          src={src}
          alt=""
          width={large ? 40 : 32}
          height={large ? 40 : 32}
          className="size-full object-contain p-1"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="text-[13px] font-medium text-muted-foreground">
          {team.abbreviation?.slice(0, 3) ?? team.name.slice(0, 2)}
        </span>
      )}
    </span>
  );
}

function inningForTeam(match: MatchCard, teamId: number) {
  return match.innings.find((inning) => inning.battingTeamId === teamId);
}

function TeamRow({
  match,
  team,
  large,
}: {
  match: MatchCard;
  team: MatchCard["teamA"];
  large?: boolean;
}) {
  const inning = inningForTeam(match, team.id);
  const won = match.winningTeam?.id === team.id;
  return (
    <div className={cn("flex min-w-0 items-center gap-3", large ? "py-2" : "py-1.5")}>
      <TeamLogo team={team} large={large} />
      <span
        className={cn(
          "min-w-0 flex-1 wrap-break-word",
          large && "text-base",
          won ? "font-medium text-foreground" : "text-text-secondary",
        )}
      >
        {team.name}
      </span>
      <span className={cn("shrink-0 font-mono tabular-nums text-foreground", large ? "text-xl" : "text-base")}>
        {inning?.scores ?? "—"}
        {inning?.overs ? (
          <span className="ml-1.5 font-sans text-[13px] text-muted-foreground">
            ({inning.overs})
          </span>
        ) : null}
      </span>
    </div>
  );
}

function dateLabel(startAt: string | null) {
  if (!startAt) return "Date TBC";
  return new Date(startAt).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

export function MatchBlock({ match, featured }: { match: MatchCard; featured?: boolean }) {
  const meta = [match.subtitle, match.venue?.name].filter(Boolean).join(" · ");
  const result = match.statusNote ?? match.statusText;
  const title = match.shortTitle ?? match.title;
  return (
    <Link
      href={`/matches/${match.id}`}
      aria-label={`Open ${title}`}
      className={cn(
        "group block rounded-lg border transition-[background-color,border-color,transform] duration-120 ease-out focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.995]",
        featured
          ? "border-border bg-card px-4 py-5 hover:border-border-strong hover:bg-muted sm:px-5"
          : "border-transparent bg-background px-3 py-3 hover:border-border hover:bg-card sm:px-4",
      )}
    >
      <div className="mb-3 flex min-w-0 items-start justify-between gap-4 border-b border-border pb-3">
        <div className="min-w-0">
          {featured ? <p className="mb-1 text-sm font-medium text-primary">Latest result</p> : null}
          <h2 className={cn("wrap-break-word font-heading text-foreground", featured ? "text-2xl" : "text-lg")}>
            {featured ? title : dateLabel(match.startAt)}
          </h2>
          <p className="mt-1 text-sm text-text-secondary">{featured ? [dateLabel(match.startAt), meta].filter(Boolean).join(" · ") : meta}</p>
        </div>
      </div>
      <TeamRow match={match} team={match.teamA} large={featured} />
      <TeamRow match={match} team={match.teamB} large={featured} />
      {result ? (
        <p className="mt-3 border-t border-border pt-3 text-sm text-text-secondary">
          {result}
        </p>
      ) : null}
    </Link>
  );
}

export function HomeView({ initialList }: { initialList: MatchListResponse }) {
  const [matches, setMatches] = useState(initialList.data);
  const [page, setPage] = useState(initialList.meta.page);
  const [totalPages, setTotalPages] = useState(initialList.meta.total_pages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || page >= totalPages) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const next = await fetchMatchPage(page + 1);
      setMatches((current) => {
        const seen = new Set(current.map((match) => match.id));
        return [...current, ...next.data.filter((match) => !seen.has(match.id))];
      });
      setPage(next.meta.page);
      setTotalPages(next.meta.total_pages);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load matches");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [page, totalPages]);

  const hasMore = page < totalPages;

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || error) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) void loadMore();
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, error, loadMore, matches.length]);

  return (
    <div>
      <header className="mb-8">
        <SectionTitle>IPL 2022</SectionTitle>
      </header>

      {matches.length === 0 && !hasMore ? (
        <p className="text-sm text-text-secondary">No matches in this season yet.</p>
      ) : (
        <section className="aiko-match-list space-y-3">
          {matches.map((match, index) => (
            <MatchBlock key={match.id} match={match} featured={index === 0} />
          ))}
        </section>
      )}

      {error ? (
        <p className="mt-8 text-sm text-destructive" role="alert">
          {error}.{" "}
          <button
            type="button"
            className="text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
            onClick={() => void loadMore()}
          >
            Try again
          </button>
        </p>
      ) : null}

      {hasMore && !error ? (
        <div
          ref={sentinelRef}
          className="mt-8 h-12"
          aria-busy={loading}
          aria-label={loading ? "Loading more matches" : undefined}
        >
          {loading ? <p className="text-center text-sm text-muted-foreground">Loading</p> : null}
        </div>
      ) : null}
    </div>
  );
}

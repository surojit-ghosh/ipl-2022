"use client";

import { MatchBlock } from "@/features/home/home-view";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import type { SquadMember, TeamMatches, TeamProfile, TeamStatSnapshot, TeamStats } from "./types";

function teamImage(team: TeamProfile) {
  return team.logoUrl ?? team.thumbnailUrl;
}

function TeamMark({ team }: { team: TeamProfile }) {
  const [failed, setFailed] = useState(false);
  const image = teamImage(team);
  return (
    <span className="inline-flex size-20 shrink-0 items-center justify-center rounded-full bg-muted text-xl font-medium text-muted-foreground sm:size-24">
      {image && !failed ? (
        <Image src={image} alt="" width={96} height={96} className="size-full object-contain p-2" onError={() => setFailed(true)} />
      ) : (
        team.abbreviation?.slice(0, 3) ?? team.name.slice(0, 2)
      )}
    </span>
  );
}

function StatCard({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 font-mono text-xl tabular-nums text-foreground">{value ?? "—"}</p>
    </div>
  );
}

function metricLabel(metric: string) {
  return metric.replace(/^team_/, "").replaceAll("_", " ").replace(/^./, (char) => char.toUpperCase());
}

function SnapshotCard({ snapshot }: { snapshot: TeamStatSnapshot }) {
  const values = Object.entries(snapshot.values).filter(
    ([key, value]) => key !== "team" && value !== null && typeof value !== "object",
  );
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <p className="text-xs tracking-wide text-muted-foreground uppercase">{metricLabel(snapshot.metric)}</p>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {values.length ? values.map(([key, value]) => (
          <span key={key}><span className="text-muted-foreground">{metricLabel(key)}:</span> <span className="font-mono tabular-nums">{String(value)}</span></span>
        )) : <span className="text-muted-foreground">No metric values</span>}
      </div>
    </div>
  );
}

function SquadRow({ member }: { member: SquadMember }) {
  const [failed, setFailed] = useState(false);
  const image = member.player.logoUrl ?? member.player.thumbnailUrl;
  const initials = member.player.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-w-0 items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
      <span className="inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-medium text-muted-foreground">
        {image && !failed ? (
          <Image
            src={image}
            alt=""
            width={36}
            height={36}
            loading="lazy"
            className="size-full object-cover"
            onError={() => setFailed(true)}
          />
        ) : (
          initials || "—"
        )}
      </span>
      <div className="min-w-0">
        <Link
          href={`/players/${member.player.id}`}
          className="wrap-break-word text-sm font-medium text-foreground underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
        >
          {member.player.name}
        </Link>
        <p className="text-xs text-muted-foreground">{member.role ?? member.player.playingRole ?? "Squad member"}</p>
      </div>
    </div>
  );
}

export function TeamDetailView({
  team,
  stats,
  matches,
}: {
  team: TeamProfile;
  stats: TeamStats;
  matches: TeamMatches;
}) {
  const standing = team.standings[0];
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 rounded-xl border border-border bg-card px-5 py-6 sm:flex-row sm:items-center sm:px-8">
        <TeamMark team={team} />
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{[team.abbreviation, team.alternateName, team.type, team.country].filter(Boolean).join(" · ")}</p>
          <h1 className="mt-1 wrap-break-word font-heading text-4xl text-foreground">{team.name}</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Standing{" "}
            <span className="font-mono font-medium tabular-nums text-primary">
              {standing ? `#${standing.position}` : "—"}
            </span>
          </p>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Matches" value={stats.matches} />
        <StatCard label="Wins" value={stats.wins} />
        <StatCard label="Losses" value={stats.losses} />
        <StatCard label="Points" value={standing?.points ?? null} />
        <StatCard label="Net run rate" value={standing?.netRunRate?.toFixed(3) ?? null} />
      </section>

      <section>
        <div className="mb-3">
          <p className="text-sm text-muted-foreground">Archived source metrics</p>
          <h2 className="font-heading text-2xl text-foreground">Team performance</h2>
        </div>
        {stats.snapshots.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stats.snapshots.map((snapshot) => <SnapshotCard key={snapshot.id} snapshot={snapshot} />)}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-border px-4 py-8 text-sm text-text-secondary">No stored team metrics available.</p>
        )}
      </section>

      <section>
        <div className="mb-3">
          <p className="text-sm text-muted-foreground">Team list</p>
          <h2 className="font-heading text-2xl text-foreground">Squad</h2>
        </div>
        {team.seasonSquadMembers.length ? (
          <div className="grid overflow-hidden rounded-lg border border-border bg-card sm:grid-cols-2 lg:grid-cols-3">
            {[...team.seasonSquadMembers]
              .sort((a, b) => a.player.name.localeCompare(b.player.name))
              .map((member) => <SquadRow key={`${member.season.year}-${member.player.id}`} member={member} />)}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-border px-4 py-8 text-sm text-text-secondary">No squad data available.</p>
        )}
      </section>

      <section>
        <div className="min-w-0">
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Season record</p>
              <h2 className="font-heading text-2xl text-foreground">Match history</h2>
            </div>
            <span className="text-sm text-text-secondary">{matches.meta.total_items} matches</span>
          </div>
          {matches.data.length ? (
            <div className="aiko-match-list space-y-3">
              {matches.data.map((match) => <MatchBlock key={match.id} match={match} />)}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-border px-4 py-8 text-sm text-text-secondary">No matches found.</p>
          )}
        </div>
      </section>
    </div>
  );
}

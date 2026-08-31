"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import type { CareerBatting, CareerBowling, PlayerDetail, PlayerSeasonStats } from "./types";

function number(value: number | null, digits = 0) {
  if (value === null) return "—";
  return digits ? value.toFixed(digits) : String(value);
}

function dateLabel(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function PlayerMark({ player }: { player: PlayerDetail }) {
  const [failed, setFailed] = useState(false);
  const image = player.logoUrl ?? player.thumbnailUrl;
  return (
    <span className="inline-flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-2xl font-medium text-muted-foreground">
      {image && !failed ? (
        <Image src={image} alt="" width={96} height={96} className="size-full object-cover" onError={() => setFailed(true)} />
      ) : (
        initials(player.name)
      )}
    </span>
  );
}

function StatCard({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 wrap-break-word font-mono text-xl tabular-nums text-foreground">{value ?? "—"}</p>
    </div>
  );
}

function ProfileCard({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 wrap-break-word text-sm font-medium text-foreground">{value || "—"}</p>
    </div>
  );
}

function CareerBattingTable({ rows }: { rows: CareerBatting[] }) {
  const populated = rows.filter((row) => row.matches !== null || row.innings !== null || row.runs !== null);
  if (!populated.length) return <EmptyState>No batting career data available.</EmptyState>;
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full min-w-245 text-sm">
        <caption className="sr-only">Player batting career by format</caption>
        <thead>
          <tr>
            <th className="px-4 py-3 text-left">Format</th>
            <th className="px-4 py-3 text-right">M</th>
            <th className="px-4 py-3 text-right">Inn</th>
            <th className="px-4 py-3 text-right">NO</th>
            <th className="px-4 py-3 text-right">Runs</th>
            <th className="px-4 py-3 text-right">Balls</th>
            <th className="px-4 py-3 text-right">HS</th>
            <th className="px-4 py-3 text-right">100s</th>
            <th className="px-4 py-3 text-right">50s</th>
            <th className="px-4 py-3 text-right">4s</th>
            <th className="px-4 py-3 text-right">6s</th>
            <th className="px-4 py-3 text-right">Ct</th>
            <th className="px-4 py-3 text-right">St</th>
            <th className="px-4 py-3 text-right">Avg</th>
            <th className="px-4 py-3 text-right">SR</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {populated.map((row) => (
            <tr key={row.id}>
              <th scope="row" className="px-4 py-3 text-left font-medium">
                {row.format}
              </th>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{number(row.matches)}</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{number(row.innings)}</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{number(row.notOuts)}</td>
              <td className="px-4 py-3 text-right font-mono font-medium tabular-nums">{number(row.runs)}</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{number(row.balls)}</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{number(row.highest)}</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{number(row.hundreds)}</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{number(row.fifties)}</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{number(row.fours)}</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{number(row.sixes)}</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{number(row.catches)}</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{number(row.stumpings)}</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{number(row.sourceAverage, 2)}</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{number(row.sourceStrike, 2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CareerBowlingTable({ rows }: { rows: CareerBowling[] }) {
  const populated = rows.filter((row) => row.matches !== null || row.innings !== null || row.wickets !== null);
  if (!populated.length) return <EmptyState>No bowling career data available.</EmptyState>;
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full min-w-290 text-sm">
        <caption className="sr-only">Player bowling career by format</caption>
        <thead>
          <tr>
            <th className="px-4 py-3 text-left">Format</th>
            <th className="px-4 py-3 text-right">M</th>
            <th className="px-4 py-3 text-right">Inn</th>
            <th className="px-4 py-3 text-right">Balls</th>
            <th className="px-4 py-3 text-right">Overs</th>
            <th className="px-4 py-3 text-right">Runs</th>
            <th className="px-4 py-3 text-right">Wkts</th>
            <th className="px-4 py-3 text-right">Best</th>
            <th className="px-4 py-3 text-right">Best match</th>
            <th className="px-4 py-3 text-right">4W</th>
            <th className="px-4 py-3 text-right">5W</th>
            <th className="px-4 py-3 text-right">10W</th>
            <th className="px-4 py-3 text-right">Hat tricks</th>
            <th className="px-4 py-3 text-right">Mdns</th>
            <th className="px-4 py-3 text-right">Econ</th>
            <th className="px-4 py-3 text-right">Avg</th>
            <th className="px-4 py-3 text-right">SR</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {populated.map((row) => (
            <tr key={row.id}>
              <th scope="row" className="px-4 py-3 text-left font-medium">
                {row.format}
              </th>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{number(row.matches)}</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{number(row.innings)}</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{number(row.balls)}</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{number(row.overs, 1)}</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{number(row.runs)}</td>
              <td className="px-4 py-3 text-right font-mono font-medium tabular-nums">{number(row.wickets)}</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{row.bestInning ?? "—"}</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{row.bestMatch ?? "—"}</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{number(row.fours)}</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{number(row.fives)}</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{number(row.tens)}</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{number(row.hatTricks)}</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{number(row.maidens)}</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{number(row.sourceEconomy, 2)}</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{number(row.sourceAverage, 2)}</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{number(row.sourceStrike, 2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState({ children }: { children: string }) {
  return <p className="rounded-lg border border-dashed border-border px-4 py-8 text-sm text-text-secondary">{children}</p>;
}

function SeasonStats({ stats }: { stats: PlayerSeasonStats }) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">IPL 2022</p>
        <h2 className="font-heading text-2xl text-foreground">Season stats</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Runs" value={stats.batting.runs} />
        <StatCard label="Batting average" value={number(stats.batting.average, 2)} />
        <StatCard label="Strike rate" value={number(stats.batting.strikeRate, 2)} />
        <StatCard label="Wickets" value={stats.bowling.wickets} />
        <StatCard label="Runs conceded" value={stats.bowling.runsConceded} />
        <StatCard label="Economy" value={number(stats.bowling.economy, 2)} />
        <StatCard label="Batting innings" value={stats.batting.innings} />
        <StatCard label="Bowling innings" value={stats.bowling.innings} />
      </div>
    </section>
  );
}

export function PlayerDetailView({ player, stats }: { player: PlayerDetail; stats: PlayerSeasonStats }) {
  return (
    <div className="space-y-8">
      <Link
        href="/players"
        className="inline-block text-sm text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Back to players
      </Link>

      <header className="flex flex-col gap-5 rounded-xl border border-border bg-card px-5 py-6 sm:flex-row sm:items-center sm:px-8">
        <PlayerMark player={player} />
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{[player.playingRole, player.country ?? player.nationality].filter(Boolean).join(" · ")}</p>
          <h1 className="mt-1 wrap-break-word font-heading text-4xl text-foreground">{player.name}</h1>
          {player.shortName && player.shortName !== player.name ? (
            <p className="mt-1 text-sm text-text-secondary">{player.shortName}</p>
          ) : null}
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <ProfileCard label="Role" value={player.playingRole} />
        <ProfileCard label="Batting style" value={player.battingStyle} />
        <ProfileCard label="Bowling style" value={player.bowlingStyle} />
        <ProfileCard label="Born" value={dateLabel(player.birthDate)} />
        <ProfileCard label="Birthplace" value={player.birthPlace} />
        <ProfileCard label="Fielding position" value={player.fieldingPosition} />
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Team history</p>
          <h2 className="font-heading text-2xl text-foreground">Squad history</h2>
        </div>
        {player.seasonSquadMembers.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {player.seasonSquadMembers.map((member) => (
              <Link
                key={`${member.season.year}-${member.team.id}`}
                href={`/teams/${member.team.id}`}
                className="rounded-lg border border-border bg-card px-4 py-3 transition-[background-color,border-color,transform] duration-120 ease-out hover:-translate-y-px hover:border-border-strong hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <p className="font-heading text-xl text-foreground">{member.team.name}</p>
                <p className="mt-1 text-sm text-text-secondary">
                  {member.season.year} · {member.role ?? "Squad member"}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState>No squad history available.</EmptyState>
        )}
      </section>

      <SeasonStats stats={stats} />

      <section className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Career snapshots</p>
          <h2 className="font-heading text-2xl text-foreground">Batting career</h2>
        </div>
        <CareerBattingTable rows={player.careerBatting} />
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-2xl text-foreground">Bowling career</h2>
        <CareerBowlingTable rows={player.careerBowling} />
      </section>
    </div>
  );
}

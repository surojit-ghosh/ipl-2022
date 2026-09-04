"use client";

import Link from "next/link";

import { DataTable } from "@/components/data-table";
import { EntityImage } from "@/components/entity-image";
import { EmptyState } from "@/components/empty-state";
import { StatCard as SharedStatCard } from "@/components/stat-card";
import { TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

function PlayerMark({ player }: { player: PlayerDetail }) {
  const image = player.logoUrl ?? player.thumbnailUrl;
  return (
    <EntityImage
      kind="player"
      src={image}
      alt=""
      width={96}
      height={96}
      loading="eager"
      className="size-24 rounded-full"
      imageClassName="object-cover"
    />
  );
}

function StatCard({ label, value }: { label: string; value: string | number | null }) {
  return <SharedStatCard label={label} value={value ?? "—"} />;
}

function ProfileCard({ label, value }: { label: string; value: string | null }) {
  return <SharedStatCard label={label} value={value || "—"} />;
}

function CareerBattingTable({ rows }: { rows: CareerBatting[] }) {
  const populated = rows.filter((row) => row.matches !== null || row.innings !== null || row.runs !== null);
  if (!populated.length) return <EmptyState title="No batting career data" description="This player has no batting career rows in the archive." />;
  return (
    <DataTable label="Player batting career" minWidth="min-w-245">
        <TableCaption className="sr-only">Player batting career by format</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Format</TableHead>
            <TableHead className="text-right">M</TableHead>
            <TableHead className="text-right">Inn</TableHead>
            <TableHead className="text-right">NO</TableHead>
            <TableHead className="text-right">Runs</TableHead>
            <TableHead className="text-right">Balls</TableHead>
            <TableHead className="text-right">HS</TableHead>
            <TableHead className="text-right">100s</TableHead>
            <TableHead className="text-right">50s</TableHead>
            <TableHead className="text-right">4s</TableHead>
            <TableHead className="text-right">6s</TableHead>
            <TableHead className="text-right">Ct</TableHead>
            <TableHead className="text-right">St</TableHead>
            <TableHead className="text-right">Avg</TableHead>
            <TableHead className="text-right">SR</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {populated.map((row) => (
            <TableRow key={row.id}>
              <th scope="row" className="px-4 py-3 text-left align-middle font-medium">
                {row.format}
              </th>
              <TableCell className="text-right font-mono tabular-nums">{number(row.matches)}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{number(row.innings)}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{number(row.notOuts)}</TableCell>
              <TableCell className="text-right font-mono font-medium tabular-nums">{number(row.runs)}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{number(row.balls)}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{number(row.highest)}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{number(row.hundreds)}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{number(row.fifties)}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{number(row.fours)}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{number(row.sixes)}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{number(row.catches)}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{number(row.stumpings)}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{number(row.sourceAverage, 2)}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{number(row.sourceStrike, 2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
    </DataTable>
  );
}

function CareerBowlingTable({ rows }: { rows: CareerBowling[] }) {
  const populated = rows.filter((row) => row.matches !== null || row.innings !== null || row.wickets !== null);
  if (!populated.length) return <EmptyState title="No bowling career data" description="This player has no bowling career rows in the archive." />;
  return (
    <DataTable label="Player bowling career" minWidth="min-w-290">
        <TableCaption className="sr-only">Player bowling career by format</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Format</TableHead>
            <TableHead className="text-right">M</TableHead>
            <TableHead className="text-right">Inn</TableHead>
            <TableHead className="text-right">Balls</TableHead>
            <TableHead className="text-right">Overs</TableHead>
            <TableHead className="text-right">Runs</TableHead>
            <TableHead className="text-right">Wkts</TableHead>
            <TableHead className="text-right">Best</TableHead>
            <TableHead className="text-right">Best match</TableHead>
            <TableHead className="text-right">4W</TableHead>
            <TableHead className="text-right">5W</TableHead>
            <TableHead className="text-right">10W</TableHead>
            <TableHead className="text-right">Hat tricks</TableHead>
            <TableHead className="text-right">Mdns</TableHead>
            <TableHead className="text-right">Econ</TableHead>
            <TableHead className="text-right">Avg</TableHead>
            <TableHead className="text-right">SR</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {populated.map((row) => (
            <TableRow key={row.id}>
              <th scope="row" className="px-4 py-3 text-left align-middle font-medium">
                {row.format}
              </th>
              <TableCell className="text-right font-mono tabular-nums">{number(row.matches)}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{number(row.innings)}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{number(row.balls)}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{number(row.overs, 1)}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{number(row.runs)}</TableCell>
              <TableCell className="text-right font-mono font-medium tabular-nums">{number(row.wickets)}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{row.bestInning ?? "—"}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{row.bestMatch ?? "—"}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{number(row.fours)}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{number(row.fives)}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{number(row.tens)}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{number(row.hatTricks)}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{number(row.maidens)}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{number(row.sourceEconomy, 2)}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{number(row.sourceAverage, 2)}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{number(row.sourceStrike, 2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
    </DataTable>
  );
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
                className="rounded-lg border border-border bg-card px-4 py-3 transition-[background-color,border-color,transform] duration-[120ms] ease-[var(--ease-out)] hover:-translate-y-px hover:border-border-strong hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <p className="font-heading text-xl text-foreground">{member.team.name}</p>
                <p className="mt-1 text-sm text-text-secondary">
                  {member.season.year} · {member.role ?? "Squad member"}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title="No squad history" description="This player has no linked IPL 2022 squad records." />
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

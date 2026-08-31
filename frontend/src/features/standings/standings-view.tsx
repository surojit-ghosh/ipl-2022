"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

import type { Standing, StandingTeam } from "./types";

function teamImage(team: StandingTeam) {
  return team.logoUrl ?? team.thumbnailUrl;
}

function TeamMark({ team }: { team: StandingTeam }) {
  const [failed, setFailed] = useState(false);
  const image = teamImage(team);
  return (
    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
      {image && !failed ? (
        <Image
          src={image}
          alt=""
          width={36}
          height={36}
          loading="lazy"
          decoding="async"
          className="size-full object-contain p-1"
          onError={() => setFailed(true)}
        />
      ) : (
        team.abbreviation?.slice(0, 3) ?? team.name.slice(0, 2)
      )}
    </span>
  );
}

function number(value: number | null, digits = 0) {
  if (value === null) return "-";
  return digits ? value.toFixed(digits) : String(value);
}

function recentResults(value: string | null) {
  return value
    ?.split(",")
    .map((result) => result.trim().toUpperCase())
    .filter(Boolean) ?? [];
}

function recentMatchIds(value: string | null) {
  return value?.split(",").map((item) => item.trim()).filter((item) => /^\d+$/.test(item)) ?? [];
}

function Form({ resultsValue, matchesValue }: { resultsValue: string | null; matchesValue: string | null }) {
  const results = recentResults(resultsValue);
  const matchIds = recentMatchIds(matchesValue);
  if (!results.length) return <span className="text-muted-foreground">-</span>;

  return (
    <span className="flex gap-1.5" aria-label={`Recent form: ${results.join(", ")}`}>
      {results.map((result, index) => {
        const className = `inline-flex size-6 items-center justify-center rounded-full text-xs font-medium ${
          result === "W"
            ? "bg-[color-mix(in_srgb,var(--success)_16%,var(--surface))] text-success"
            : result === "L"
              ? "bg-[color-mix(in_srgb,var(--danger)_12%,var(--surface))] text-danger"
              : "bg-muted text-muted-foreground"
        }`;
        const matchId = matchIds[index];

        return matchId ? (
          <Link key={`${result}-${index}`} href={`/matches/${matchId}`} className={`${className} focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none`} aria-label={`${result}, match ${matchId}`}>
            {result}
          </Link>
        ) : (
          <span key={`${result}-${index}`} className={className}>
            {result}
          </span>
        );
      })}
    </span>
  );
}
function StandingRow({ standing }: { standing: Standing }) {
  return (
    <tr className="transition-colors duration-120 ease-out hover:bg-muted/60">
      <td className="px-4 py-4 font-mono text-sm tabular-nums text-muted-foreground">{standing.position}</td>
      <th scope="row" className="px-4 py-4 text-left">
        <Link
          href={`/teams/${standing.team.id}`}
          className="flex min-w-48 items-center gap-3 rounded-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <TeamMark team={standing.team} />
          <span className="min-w-0">
            <span className="block wrap-break-word font-medium text-foreground">{standing.team.name}</span>
            <span className="block text-xs text-muted-foreground">{standing.team.abbreviation ?? "-"}</span>
          </span>
        </Link>
      </th>
      <td className="px-4 py-4 text-right font-mono tabular-nums">{number(standing.played)}</td>
      <td className="px-4 py-4 text-right font-mono tabular-nums">{number(standing.wins)}</td>
      <td className="px-4 py-4 text-right font-mono tabular-nums">{number(standing.losses)}</td>
      <td className="px-4 py-4 text-right font-mono tabular-nums">{number(standing.draws)}</td>
      <td className="px-4 py-4 text-right font-mono tabular-nums">{number(standing.noResults)}</td>
      <td className="px-4 py-4 text-right font-mono tabular-nums">{standing.oversFor ?? "-"}</td>
      <td className="px-4 py-4 text-right font-mono tabular-nums">{number(standing.runsFor)}</td>
      <td className="px-4 py-4 text-right font-mono tabular-nums">{standing.oversAgainst ?? "-"}</td>
      <td className="px-4 py-4 text-right font-mono tabular-nums">{number(standing.runsAgainst)}</td>
      <td className="px-4 py-4 text-right font-mono tabular-nums">{number(standing.points)}</td>
      <td className="px-4 py-4 text-right font-mono tabular-nums">{number(standing.netRunRate, 3)}</td>
      <td className="px-4 py-4">
        <Form resultsValue={standing.lastFiveResults} matchesValue={standing.lastFiveMatches} />
      </td>
    </tr>
  );
}

export function StandingsView({ standings }: { standings: Standing[] }) {
  const season = standings[0]?.season;

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-sm text-muted-foreground">League table</p>
          <h1 className="font-heading text-3xl text-foreground">{season ? `IPL ${season.year}` : "Standings"}</h1>
        </div>
      </header>

      {standings.length ? (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full min-w-225 text-sm">
            <caption className="sr-only">IPL standings with team records, run totals, points, net run rate, and recent form</caption>
            <thead>
              <tr>
                <th className="w-14 px-4 py-3 text-left">Pos</th>
                <th className="px-4 py-3 text-left">Team</th>
                <th className="px-4 py-3 text-right">P</th>
                <th className="px-4 py-3 text-right">W</th>
                <th className="px-4 py-3 text-right">L</th>
                <th className="px-4 py-3 text-right">D</th>
                <th className="px-4 py-3 text-right">NR</th>
                <th className="px-4 py-3 text-right">Overs for</th>
                <th className="px-4 py-3 text-right">Runs for</th>
                <th className="px-4 py-3 text-right">Overs against</th>
                <th className="px-4 py-3 text-right">Runs against</th>
                <th className="px-4 py-3 text-right">Pts</th>
                <th className="px-4 py-3 text-right">NRR</th>
                <th className="px-4 py-3 text-left">Form</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {standings.map((standing) => <StandingRow key={standing.id} standing={standing} />)}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-border px-4 py-8 text-sm text-text-secondary">
          No standings available for this season yet.
        </p>
      )}
    </div>
  );
}

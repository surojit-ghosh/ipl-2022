"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { DataTable } from "@/components/data-table";
import { EntityImage } from "@/components/entity-image";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchStandings } from "./api";
import type { Standing, StandingTeam } from "./types";

function teamImage(team: StandingTeam) {
  return team.logoUrl ?? team.thumbnailUrl;
}

function TeamMark({ team }: { team: StandingTeam }) {
  const image = teamImage(team);
  return (
    <EntityImage
      kind="team"
      src={image}
      alt=""
      width={36}
      height={36}
      className="size-9 rounded-full"
      imageClassName="object-contain p-1"
    />
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
    <TableRow>
      <TableCell className="font-mono text-sm text-muted-foreground tabular-nums">{standing.position}</TableCell>
      <th scope="row" className="px-4 py-3 text-left align-middle">
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
      <TableCell className="text-right font-mono tabular-nums">{number(standing.played)}</TableCell>
      <TableCell className="text-right font-mono tabular-nums">{number(standing.wins)}</TableCell>
      <TableCell className="text-right font-mono tabular-nums">{number(standing.losses)}</TableCell>
      <TableCell className="text-right font-mono tabular-nums">{number(standing.draws)}</TableCell>
      <TableCell className="text-right font-mono tabular-nums">{number(standing.noResults)}</TableCell>
      <TableCell className="text-right font-mono tabular-nums">{standing.oversFor ?? "-"}</TableCell>
      <TableCell className="text-right font-mono tabular-nums">{number(standing.runsFor)}</TableCell>
      <TableCell className="text-right font-mono tabular-nums">{standing.oversAgainst ?? "-"}</TableCell>
      <TableCell className="text-right font-mono tabular-nums">{number(standing.runsAgainst)}</TableCell>
      <TableCell className="text-right font-mono tabular-nums">{number(standing.points)}</TableCell>
      <TableCell className="text-right font-mono tabular-nums">{number(standing.netRunRate, 3)}</TableCell>
      <TableCell>
        <Form resultsValue={standing.lastFiveResults} matchesValue={standing.lastFiveMatches} />
      </TableCell>
    </TableRow>
  );
}

export function StandingsView({ standings: initialStandings }: { standings: Standing[] }) {
  const { data: standings = initialStandings } = useQuery({
    queryKey: ["standings"],
    queryFn: async () => {
      const res = await fetchStandings();
      return res.data;
    },
    initialData: initialStandings,
  });

  const season = standings[0]?.season;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="IPL 2022 · League Standings"
        title={season ? `IPL ${season.year} Standings` : "Standings"}
        subtitle="Official franchise table · Net Run Rate (NRR) · Form guide"
      />

      {standings.length ? (
        <DataTable label="IPL standings" minWidth="min-w-225">
          <TableCaption className="sr-only">IPL standings with team records, run totals, points, net run rate, and recent form</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">Pos</TableHead>
              <TableHead>Team</TableHead>
              <TableHead className="text-right">P</TableHead>
              <TableHead className="text-right">W</TableHead>
              <TableHead className="text-right">L</TableHead>
              <TableHead className="text-right">D</TableHead>
              <TableHead className="text-right">NR</TableHead>
              <TableHead className="text-right">Overs for</TableHead>
              <TableHead className="text-right">Runs for</TableHead>
              <TableHead className="text-right">Overs against</TableHead>
              <TableHead className="text-right">Runs against</TableHead>
              <TableHead className="text-right">Pts</TableHead>
              <TableHead className="text-right">NRR</TableHead>
              <TableHead>Form</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {standings.map((standing) => <StandingRow key={standing.id} standing={standing} />)}
          </TableBody>
        </DataTable>
      ) : (
        <EmptyState title="No standings available" description="The IPL 2022 standings endpoint returned no table rows." />
      )}
    </div>
  );
}

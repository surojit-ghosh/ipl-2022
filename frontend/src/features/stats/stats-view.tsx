"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/page-header";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { fetchStats } from "./api";
import type {
  BattingCategory,
  BattingStat,
  BowlingCategory,
  BowlingStat,
  StatsData,
  StatsScope,
  TeamStat,
  VenueStat,
} from "./types";

const SCOPES: { id: StatsScope; label: string }[] = [
  { id: "league", label: "League" },
  { id: "playoffs", label: "Playoffs" },
  { id: "all", label: "All matches" },
];

const BATTING_CATEGORIES: { id: BattingCategory; label: string; description: string }[] = [
  { id: "batting_most_runs", label: "Most runs", description: "Top run scorers, with innings, strike rate, and boundaries." },
  { id: "batting_most_runs_innings", label: "Highest individual score", description: "Highest scores made in one innings." },
  { id: "batting_highest_strikerate", label: "Highest strike rate", description: "Best aggregate strike rates across the selected scope." },
  { id: "batting_highest_strikerate_innings", label: "Highest strike rate in an innings", description: "Fastest individual innings with at least one ball faced." },
  { id: "batting_highest_average", label: "Highest average", description: "Runs per dismissal across the selected scope." },
  { id: "batting_most_run100", label: "Most centuries", description: "Players with the most innings of 100 runs or more." },
  { id: "batting_most_run50", label: "Most fifties", description: "Players with the most innings scoring 50 to 99 runs." },
  { id: "batting_most_run6", label: "Most sixes", description: "Most sixes across the selected scope." },
  { id: "batting_most_run6_innings", label: "Most sixes in an innings", description: "Most sixes hit in one innings." },
  { id: "batting_most_run4", label: "Most fours", description: "Most fours across the selected scope." },
  { id: "batting_most_run4_innings", label: "Most fours in an innings", description: "Most fours hit in one innings." },
];

const BOWLING_CATEGORIES: { id: BowlingCategory; label: string; description: string }[] = [
  { id: "bowling_top_wicket_takers", label: "Top wicket takers", description: "Most wickets across the selected scope." },
  { id: "bowling_best_economy_rates", label: "Best economy rate", description: "Lowest aggregate runs per six legal balls." },
  { id: "bowling_best_economy_rates_innings", label: "Best economy rate in an innings", description: "Most economical individual spells." },
  { id: "bowling_best_bowling_figures", label: "Best bowling figures", description: "Most wickets for the fewest runs in one spell." },
  { id: "bowling_best_strike_rates", label: "Best strike rate", description: "Fewest balls per wicket across the selected scope." },
  { id: "bowling_best_strike_rates_innings", label: "Best strike rate in an innings", description: "Fewest balls per wicket in one spell." },
  { id: "bowling_best_averages", label: "Best bowling average", description: "Fewest runs conceded per wicket across the selected scope." },
  { id: "bowling_most_runs_conceded_innings", label: "Most runs conceded in an innings", description: "Highest runs conceded in one spell." },
  { id: "bowling_four_wickets", label: "Four-wicket hauls", description: "Most spells with at least four wickets." },
  { id: "bowling_five_wickets", label: "Five-wicket hauls", description: "Most spells with at least five wickets." },
  { id: "bowling_maidens", label: "Maidens", description: "Most maiden overs across the selected scope." },
];

function number(value: number | null, digits = 0) {
  if (value === null) return "—";
  return digits ? value.toFixed(digits) : String(value);
}

function playerImage(player: BattingStat["player"]) {
  return player.logoUrl ?? player.thumbnailUrl;
}

function PlayerMark({ player }: { player: BattingStat["player"] }) {
  const image = playerImage(player);
  const [failed, setFailed] = useState(false);
  const initials = player.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span className="inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-medium text-muted-foreground">
      {image && !failed ? (
        <Image
          src={image}
          alt=""
          width={32}
          height={32}
          unoptimized
          loading="lazy"
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        initials || "—"
      )}
    </span>
  );
}

function TeamMark({ team }: { team: TeamStat["team"] }) {
  const image = team.logoUrl ?? team.thumbnailUrl;
  const [failed, setFailed] = useState(false);
  return (
    <span className="inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-medium text-muted-foreground">
      {image && !failed ? (
        <Image
          src={image}
          alt=""
          width={32}
          height={32}
          unoptimized
          loading="lazy"
          className="size-full object-contain p-1"
          onError={() => setFailed(true)}
        />
      ) : (
        team.abbreviation?.slice(0, 3) ?? team.name.slice(0, 2)
      )}
    </span>
  );
}

type ChartDatum = {
  id: string | number;
  label: string;
  value: number;
};

function HorizontalBarChart({
  rows,
  formatValue,
  ariaLabel,
}: {
  rows: ChartDatum[];
  formatValue: (value: number) => string;
  ariaLabel: string;
}) {
  if (!rows.length) return <EmptyState>No chart data for this scope.</EmptyState>;
  const displayedRows = rows.slice(0, 10);
  const max = Math.max(...displayedRows.map((row) => row.value), 1);
  const labelWidth = 178;
  const barWidth = 472;
  const valueX = 700;
  const rowHeight = 38;
  const height = displayedRows.length * rowHeight + 18;

  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      viewBox={`0 0 760 ${height}`}
      className="h-auto w-full overflow-visible"
    >
      <line
        x1={labelWidth}
        x2={labelWidth + barWidth}
        y1="0"
        y2="0"
        stroke="var(--border-strong)"
        strokeWidth="1"
      />
      {displayedRows.map((row, index) => {
        const y = index * rowHeight + 8;
        const width = row.value ? Math.max((row.value / max) * barWidth, 3) : 0;
        return (
          <g key={row.id} transform={`translate(0 ${y})`}>
            <title>
              {row.label}: {formatValue(row.value)}
            </title>
            <text x="0" y="15" fill="var(--text-secondary)" fontSize="13">
              {row.label}
            </text>
            <rect
              x={labelWidth}
              y="4"
              width={width}
              height="18"
              rx="3"
              fill="var(--brand)"
              opacity={index === 0 ? 1 : 0.72}
            />
            <text
              x={valueX}
              y="17"
              fill="var(--text-primary)"
              fontFamily="var(--font-ibm-plex-mono)"
              fontSize="13"
              textAnchor="end"
            >
              {formatValue(row.value)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function ChartMetricSwitch<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5" aria-label={label}>
      <span className="mr-1 text-xs text-muted-foreground">{label}</span>
      {options.map((option) => (
        <Button
          key={option.id}
          type="button"
          size="sm"
          variant={value === option.id ? "default" : "outline"}
          aria-pressed={value === option.id}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <h3 className="font-heading text-2xl text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-text-secondary">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

const TEAM_CHART_METRICS = [
  { id: "runs", label: "Runs" },
  { id: "wickets", label: "Wickets" },
  { id: "runsConceded", label: "Conceded" },
  { id: "fifties", label: "Fifties" },
  { id: "centuries", label: "Centuries" },
] as const;

type TeamChartMetric = (typeof TEAM_CHART_METRICS)[number]["id"];

function TeamPerformanceChart({ rows }: { rows: TeamStat[] }) {
  const [metric, setMetric] = useState<TeamChartMetric>("runs");
  const selected = TEAM_CHART_METRICS.find((item) => item.id === metric) ?? TEAM_CHART_METRICS[0];
  const chartRows = rows
    .map((row) => ({
      id: row.team.id,
      label: row.team.abbreviation ?? row.team.name,
      value: row[metric],
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <ChartCard title="Team performance" description="Compare the selected team metric across IPL 2022.">
      <ChartMetricSwitch
        label="Team metric"
        options={TEAM_CHART_METRICS}
        value={metric}
        onChange={setMetric}
      />
      <div className="mt-4">
        <HorizontalBarChart
          rows={chartRows}
          formatValue={(value) => String(value)}
          ariaLabel={`Team performance by ${selected.label.toLowerCase()}`}
        />
      </div>
    </ChartCard>
  );
}

const BATTING_CHART_METRICS = [
  { id: "runs", label: "Runs" },
  { id: "sixes", label: "Sixes" },
  { id: "fours", label: "Fours" },
  { id: "strikeRate", label: "Strike rate" },
] as const;

type BattingChartMetric = (typeof BATTING_CHART_METRICS)[number]["id"];

function BattingLeaderboardChart({ rows }: { rows: BattingStat[] }) {
  const [metric, setMetric] = useState<BattingChartMetric>("runs");
  const selected = BATTING_CHART_METRICS.find((item) => item.id === metric) ?? BATTING_CHART_METRICS[0];
  const chartRows = rows
    .flatMap((row) => {
      const value = row[metric];
      return typeof value === "number" ? [{ id: row.id, label: row.player.shortName ?? row.player.name, value }] : [];
    })
    .sort((a, b) => b.value - a.value);

  return (
    <ChartCard title="Batting leaderboard" description="Top batters by aggregate production and scoring rate.">
      <ChartMetricSwitch
        label="Batting metric"
        options={BATTING_CHART_METRICS}
        value={metric}
        onChange={setMetric}
      />
      <div className="mt-4">
        <HorizontalBarChart
          rows={chartRows}
          formatValue={(value) => (metric === "strikeRate" ? value.toFixed(1) : String(value))}
          ariaLabel={`Batting leaderboard by ${selected.label.toLowerCase()}`}
        />
      </div>
    </ChartCard>
  );
}

const BOWLING_CHART_METRICS = [
  { id: "wickets", label: "Wickets" },
  { id: "economy", label: "Economy" },
  { id: "maidens", label: "Maidens" },
] as const;

type BowlingChartMetric = (typeof BOWLING_CHART_METRICS)[number]["id"];

function BowlingLeaderboardChart({ rows }: { rows: BowlingStat[] }) {
  const [metric, setMetric] = useState<BowlingChartMetric>("wickets");
  const selected = BOWLING_CHART_METRICS.find((item) => item.id === metric) ?? BOWLING_CHART_METRICS[0];
  const chartRows = rows
    .flatMap((row) => {
      const value = row[metric];
      return typeof value === "number" ? [{ id: row.player.id, label: row.player.shortName ?? row.player.name, value }] : [];
    })
    .sort((a, b) => (metric === "economy" ? a.value - b.value : b.value - a.value));

  return (
    <ChartCard title="Bowling leaderboard" description="Top bowlers by wickets, economy, or maidens.">
      <ChartMetricSwitch
        label="Bowling metric"
        options={BOWLING_CHART_METRICS}
        value={metric}
        onChange={setMetric}
      />
      <div className="mt-4">
        <HorizontalBarChart
          rows={chartRows}
          formatValue={(value) => (metric === "economy" ? value.toFixed(2) : String(value))}
          ariaLabel={`Bowling leaderboard by ${selected.label.toLowerCase()}`}
        />
      </div>
    </ChartCard>
  );
}

function VenueScoringChart({ rows }: { rows: VenueStat[] }) {
  const chartRows = rows.map((row) => ({
    id: row.venue.id,
    label: row.venue.name,
    value: row.averageFirstInningsScore,
  }));

  return (
    <ChartCard title="Venue scoring" description="Average first-innings score at each IPL 2022 venue.">
      <HorizontalBarChart
        rows={chartRows}
        formatValue={(value) => value.toFixed(1)}
        ariaLabel="Average first-innings score by venue"
      />
    </ChartCard>
  );
}

function TableFrame({ children }: { children: React.ReactNode }) {
  return <div className="overflow-x-auto rounded-lg border border-border bg-card">{children}</div>;
}

function battingMetric(row: BattingStat, category: BattingCategory) {
  switch (category) {
    case "batting_most_runs":
      return row.runs;
    case "batting_most_runs_innings":
      return row.highestScore;
    case "batting_highest_strikerate":
    case "batting_highest_strikerate_innings":
      return row.strikeRate;
    case "batting_highest_average":
      return row.average;
    case "batting_most_run100":
      return row.centuries;
    case "batting_most_run50":
      return row.fifties;
    case "batting_most_run6":
    case "batting_most_run6_innings":
      return row.sixes;
    case "batting_most_run4":
    case "batting_most_run4_innings":
      return row.fours;
  }
}

function metricLabel(category: BattingCategory) {
  if (category.includes("strikerate")) return "SR";
  if (category.includes("average")) return "Avg";
  if (category.includes("run100")) return "100s";
  if (category.includes("run50")) return "50s";
  if (category.includes("run6")) return "6s";
  if (category.includes("run4")) return "4s";
  return "Score";
}

function BattingTable({ rows, category }: { rows: BattingStat[]; category: BattingCategory }) {
  if (!rows.length) return <EmptyState>No batting data for this scope.</EmptyState>;
  const inningsCategory = category.endsWith("_innings");
  return (
    <TableFrame>
      <table className="w-full min-w-225 text-sm">
        <caption className="sr-only">{BATTING_CATEGORIES.find((item) => item.id === category)?.label}</caption>
        <thead>
          <tr>
            <th className="w-12 px-4 py-3 text-left">#</th>
            <th className="px-4 py-3 text-left">Player</th>
            <th className="px-4 py-3 text-right">{metricLabel(category)}</th>
            <th className="px-4 py-3 text-right">Inns</th>
            <th className="px-4 py-3 text-right">Runs</th>
            <th className="px-4 py-3 text-right">SR</th>
            <th className="px-4 py-3 text-right">4s</th>
            <th className="px-4 py-3 text-right">6s</th>
            {inningsCategory ? <th className="px-4 py-3 text-left">Match</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.slice(0, 10).map((row, index) => (
            <tr key={row.id} className="transition-colors duration-120 ease-out hover:bg-muted/60">
              <td className="px-4 py-3 font-mono text-muted-foreground tabular-nums">{index + 1}</td>
              <td className="px-4 py-3">
                <div className="flex min-w-40 items-center gap-2.5">
                  <PlayerMark player={row.player} />
                  <Link
                    href={`/players/${row.player.id}`}
                    className="min-w-0 wrap-break-word font-medium underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                  >
                    {row.player.name}
                  </Link>
                </div>
              </td>
              <td className="px-4 py-3 text-right font-mono font-medium tabular-nums">
                {number(battingMetric(row, category), category.includes("strikerate") || category.includes("average") ? 2 : 0)}
              </td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{row.innings}</td>
              <td className="px-4 py-3 text-right font-mono font-medium tabular-nums">{row.runs}</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{number(row.strikeRate, 2)}</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{row.fours}</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{row.sixes}</td>
              {inningsCategory ? (
                <td className="px-4 py-3">
                  {row.match ? (
                    <Link
                      href={`/matches/${row.match.id}`}
                      className="whitespace-nowrap underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                    >
                      {row.match.subtitle ?? row.match.title}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </TableFrame>
  );
}

function bowlingMetric(row: BowlingStat, category: BowlingCategory) {
  switch (category) {
    case "bowling_best_economy_rates":
    case "bowling_best_economy_rates_innings":
      return number(row.economy, 2);
    case "bowling_best_bowling_figures":
      return row.bestFigures ?? "—";
    case "bowling_best_strike_rates":
    case "bowling_best_strike_rates_innings":
      return number(row.strikeRate, 2);
    case "bowling_best_averages":
      return number(row.average, 2);
    case "bowling_most_runs_conceded_innings":
      return String(row.runsConceded);
    case "bowling_four_wickets":
      return String(row.fourWicketHauls);
    case "bowling_five_wickets":
      return String(row.fiveWicketHauls);
    case "bowling_maidens":
      return String(row.maidens);
    case "bowling_top_wicket_takers":
      return String(row.wickets);
  }
}

function bowlingMetricLabel(category: BowlingCategory) {
  if (category.includes("economy")) return "Econ";
  if (category.includes("strike")) return "SR";
  if (category === "bowling_best_averages") return "Avg";
  if (category === "bowling_best_bowling_figures") return "Figures";
  if (category === "bowling_most_runs_conceded_innings") return "Runs";
  if (category === "bowling_four_wickets") return "4W";
  if (category === "bowling_five_wickets") return "5W";
  if (category === "bowling_maidens") return "Mdns";
  return "Wkts";
}

function BowlingTable({ rows, category }: { rows: BowlingStat[]; category: BowlingCategory }) {
  if (!rows.length) return <EmptyState>No bowling data for this scope.</EmptyState>;
  const inningsCategory = category.includes("_innings") || category === "bowling_best_bowling_figures";
  return (
    <TableFrame>
      <table className="w-full min-w-225 text-sm">
        <caption className="sr-only">{BOWLING_CATEGORIES.find((item) => item.id === category)?.label}</caption>
        <thead>
          <tr>
            <th className="w-12 px-4 py-3 text-left">#</th>
            <th className="px-4 py-3 text-left">Player</th>
            <th className="px-4 py-3 text-right">{bowlingMetricLabel(category)}</th>
            <th className="px-4 py-3 text-right">Inns</th>
            <th className="px-4 py-3 text-right">Wkts</th>
            <th className="px-4 py-3 text-right">Econ</th>
            <th className="px-4 py-3 text-right">Runs</th>
            <th className="px-4 py-3 text-right">Mdns</th>
            {inningsCategory ? <th className="px-4 py-3 text-left">Match</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.slice(0, 10).map((row, index) => (
            <tr key={`${row.id}-${row.player.id}`} className="transition-colors duration-120 ease-out hover:bg-muted/60">
              <td className="px-4 py-3 font-mono text-muted-foreground tabular-nums">{index + 1}</td>
              <td className="px-4 py-3">
                <div className="flex min-w-40 items-center gap-2.5">
                  <PlayerMark player={row.player} />
                  <Link
                    href={`/players/${row.player.id}`}
                    className="min-w-0 wrap-break-word font-medium underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                  >
                    {row.player.name}
                  </Link>
                </div>
              </td>
              <td className="px-4 py-3 text-right font-mono font-medium tabular-nums">{bowlingMetric(row, category)}</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{row.innings}</td>
              <td className="px-4 py-3 text-right font-mono font-medium tabular-nums">{row.wickets}</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{number(row.economy, 2)}</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{row.runsConceded}</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{row.maidens}</td>
              {inningsCategory ? (
                <td className="px-4 py-3">
                  {row.match ? (
                    <Link
                      href={`/matches/${row.match.id}`}
                      className="whitespace-nowrap underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                    >
                      {row.match.subtitle ?? row.match.title}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </TableFrame>
  );
}

function TeamPerformanceTable({ rows }: { rows: TeamStat[] }) {
  if (!rows.length) return <EmptyState>No team data for this scope.</EmptyState>;
  return (
    <TableFrame>
      <table className="w-full min-w-225 text-sm">
        <caption className="sr-only">Team performance across the selected scope</caption>
        <thead>
          <tr>
            <th className="w-12 px-4 py-3 text-left">#</th>
            <th className="px-4 py-3 text-left">Team</th>
            <th className="px-4 py-3 text-right">M</th>
            <th className="px-4 py-3 text-right">W-L</th>
            <th className="px-4 py-3 text-right">Runs</th>
            <th className="px-4 py-3 text-right">Wkts</th>
            <th className="px-4 py-3 text-right">Conceded</th>
            <th className="px-4 py-3 text-right">50s</th>
            <th className="px-4 py-3 text-right">100s</th>
            <th className="px-4 py-3 text-right">High</th>
            <th className="px-4 py-3 text-right">Low</th>
            <th className="px-4 py-3 text-right">4W</th>
            <th className="px-4 py-3 text-right">5W</th>
            <th className="px-4 py-3 text-right">Extras</th>
            <th className="px-4 py-3 text-right">Best run margin</th>
            <th className="px-4 py-3 text-right">Best wicket margin</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {[...rows]
            .sort((a, b) => b.wins - a.wins || b.runs - a.runs)
            .map((row, index) => (
              <tr key={row.team.id} className="transition-colors duration-120 ease-out hover:bg-muted/60">
                <td className="px-4 py-3 font-mono text-muted-foreground tabular-nums">{index + 1}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/teams/${row.team.id}`}
                    className="flex min-w-40 items-center gap-2.5 rounded-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    <TeamMark team={row.team} />
                    <span className="min-w-0 wrap-break-word font-medium">{row.team.name}</span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">{row.matches}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">{row.wins}-{row.losses}</td>
                <td className="px-4 py-3 text-right font-mono font-medium tabular-nums">{row.runs}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">{row.wickets}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">{row.runsConceded}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">{row.fifties}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">{row.centuries}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">{number(row.highestScore)}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">{number(row.lowestScore)}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">{row.fourWicketHauls}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">{row.fiveWicketHauls}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">{row.extrasConceded}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">
                  {number(row.highestWinMarginRuns)}
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">
                  {number(row.highestWinMarginWickets)}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </TableFrame>
  );
}

function EmptyState({ children }: { children: string }) {
  return <p className="rounded-lg border border-dashed border-border px-4 py-8 text-sm text-text-secondary">{children}</p>;
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-3">
      <h2 className="font-heading text-2xl text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-text-secondary">{description}</p>
    </div>
  );
}

export function StatsView({ initialData }: { initialData: StatsData }) {
  const [scope, setScope] = useState<StatsScope>(initialData.scope);
  const [battingCategory, setBattingCategory] = useState<BattingCategory>(initialData.battingCategory);
  const [bowlingCategory, setBowlingCategory] = useState<BowlingCategory>(initialData.bowlingCategory);

  const {
    data = initialData,
    isFetching: loading,
    isError,
    error,
  } = useQuery({
    queryKey: ["stats", { scope, battingCategory, bowlingCategory }],
    queryFn: () => fetchStats(scope, battingCategory, bowlingCategory),
    initialData:
      scope === initialData.scope &&
      battingCategory === initialData.battingCategory &&
      bowlingCategory === initialData.bowlingCategory
        ? initialData
        : undefined,
  });

  const battingCategoryDetails = BATTING_CATEGORIES.find((item) => item.id === battingCategory) ?? BATTING_CATEGORIES[0];
  const bowlingCategoryDetails = BOWLING_CATEGORIES.find((item) => item.id === bowlingCategory) ?? BOWLING_CATEGORIES[0];

  return (
    <div className="space-y-8" aria-busy={loading}>
      <PageHeader
        eyebrow="IPL 2022 · Analytics & Metrics"
        title="IPL 2022 Stats"
        subtitle="Leaderboards for batting, bowling, and team milestones"
      >
        <div className="flex flex-wrap gap-2" aria-label="Stats scope">
          {SCOPES.map((item) => (
            <Button
              key={item.id}
              type="button"
              size="sm"
              variant={scope === item.id ? "default" : "outline"}
              disabled={loading}
              aria-pressed={scope === item.id}
              onClick={() => setScope(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </PageHeader>

      {isError ? (
        <p className="rounded-lg border border-danger/30 bg-card px-4 py-3 text-sm text-danger" role="alert">
          {error instanceof Error ? error.message : "Could not load stats"}. Choose another scope to retry.
        </p>
      ) : null}

      <section>
        <SectionHeading
          title="Visual insights"
          description="Native charts make the season patterns easier to compare at a glance."
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <TeamPerformanceChart rows={data.teams} />
          <BattingLeaderboardChart rows={data.battingChart} />
          <BowlingLeaderboardChart rows={data.bowlingChart} />
          <VenueScoringChart rows={data.venues} />
        </div>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <SectionHeading title={battingCategoryDetails.label} description={battingCategoryDetails.description} />
          <label className="grid gap-1 text-sm font-medium text-foreground">
            Batting stat
            <Select value={battingCategory} disabled={loading} onValueChange={(value) => setBattingCategory(value as BattingCategory)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {BATTING_CATEGORIES.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </div>
        <BattingTable rows={data.batting} category={battingCategory} />
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <SectionHeading title={bowlingCategoryDetails.label} description={bowlingCategoryDetails.description} />
          <label className="grid gap-1 text-sm font-medium text-foreground">
            Bowling stat
            <Select value={bowlingCategory} disabled={loading} onValueChange={(value) => setBowlingCategory(value as BowlingCategory)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {BOWLING_CATEGORIES.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </div>
        <BowlingTable rows={data.bowling} category={bowlingCategory} />
      </section>

      <section>
        <SectionHeading title="Team performance" description="Runs, wickets, scoring milestones, and win-loss record across the selected scope." />
        <TeamPerformanceTable rows={data.teams} />
      </section>

    </div>
  );
}

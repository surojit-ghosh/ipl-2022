"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { DataTable } from "@/components/data-table";
import { EntityImage } from "@/components/entity-image";
import { EmptyState } from "@/components/empty-state";
import { StatCard as SharedStatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

import type {
  BattingScore,
  BowlingFigure,
  CommentaryEvent,
  FieldingFigure,
  Inning,
  HistoricalSnapshotResponse,
  MatchDetail,
  MatchOfficial,
  MatchPlayingXi,
  Player,
  Team,
  WagonShot,
} from "./types";

const TABS = [
  { id: "summary", label: "Summary" },
  { id: "scorecard", label: "Scorecard" },
  { id: "commentary", label: "Commentary" },
  { id: "wagon-wheel", label: "Wagon Wheel" },
  { id: "history", label: "Historical snapshot" },
  { id: "xi", label: "Playing XI" },
  { id: "info", label: "Info" },
] as const;

type TabId = (typeof TABS)[number]["id"];
type CommentaryFilter = "all" | "wickets" | "boundaries";

function logoSrc(team: Team) {
  return team.logoUrl ?? team.thumbnailUrl;
}

function shortName(player: Player | null) {
  return player?.shortName ?? player?.name ?? "Unknown";
}

function dateLabel(value: string | null) {
  if (!value) return "Date TBC";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

function numberLabel(value: number | null | undefined, digits = 0) {
  if (value === null || value === undefined) return "—";
  return digits ? value.toFixed(digits) : String(value);
}

function tossDecisionLabel(value: number | null) {
  if (value === 1) return "bat first";
  if (value === 2) return "field first";
  return value ? `decision ${value}` : null;
}

function TeamLogo({ team, className }: { team: Team; className?: string }) {
  const src = logoSrc(team);
  return (
    <EntityImage
      kind="team"
      src={src}
      alt=""
      width={48}
      height={48}
      className={cn("size-12 rounded-full", className)}
      imageClassName="object-contain p-1.5"
    />
  );
}

function inningForTeam(match: MatchDetail, teamId: number) {
  return match.innings.find((inning) => inning.battingTeamId === teamId);
}

function TeamScore({ match, team }: { match: MatchDetail; team: Team }) {
  const inning = inningForTeam(match, team.id);
  const won = match.winningTeam?.id === team.id;
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-3 rounded-lg border border-border bg-card px-4 py-3",
        won && "border-primary/40 bg-[color-mix(in_srgb,var(--brand)_7%,var(--surface))]",
      )}
    >
      <TeamLogo team={team} />
      <div className="min-w-0 flex-1">
        <Link
          href={`/teams/${team.id}`}
          className={cn(
            "block wrap-break-word text-base underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
            won ? "font-semibold" : "text-text-secondary",
          )}
        >
          {team.name}
        </Link>
        <p className="text-xs text-muted-foreground">{team.abbreviation ?? "Team"}</p>
      </div>
      <p className="shrink-0 text-right font-mono text-xl tabular-nums">
        {inning?.scores ?? "—"}
        {inning?.overs ? <span className="block text-xs text-muted-foreground">({inning.overs})</span> : null}
      </p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | null | undefined }) {
  return <SharedStatCard label={label} value={value || "—"} />;
}

function PlayerAvatar({ player, size = "size-8" }: { player: Player | null; size?: "size-8" | "size-10" }) {
  const src = player?.logoUrl ?? player?.thumbnailUrl;
  const px = size === "size-10" ? 40 : 32;

  return (
    <EntityImage
      kind="player"
      src={src}
      alt=""
      width={px}
      height={px}
      className={cn("rounded-full", size)}
      imageClassName="object-cover"
    />
  );
}

function PlayerLine({ player, meta }: { player: Player; meta?: string | null }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <PlayerAvatar player={player} />
      <div className="min-w-0">
      <Link
        href={`/players/${player.id}`}
        className="block wrap-break-word font-medium underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
      >
        {player.name}
      </Link>
      {meta ? <p className="text-xs text-muted-foreground">{meta}</p> : null}
      </div>
    </div>
  );
}

function PlayerFact({ label, player }: { label: string; player: Player | null }) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
      <div className="mt-2 flex min-w-0 items-center gap-3">
        <PlayerAvatar player={player} size="size-10" />
        <span className="min-w-0 wrap-break-word text-sm font-medium">{player?.name ?? "—"}</span>
      </div>
    </div>
  );
}

function BestOfMatch({ match }: { match: MatchDetail }) {
  const bestBatters = useMemo(
    () =>
      match.innings
        .flatMap((inning) => inning.battingScores.map((score) => ({ ...score, inning })))
        .filter((score) => score.runs !== null)
        .sort((a, b) => (b.runs ?? 0) - (a.runs ?? 0))
        .slice(0, 3),
    [match.innings],
  );
  const bestBowlers = useMemo(
    () =>
      match.innings
        .flatMap((inning) => inning.bowlingFigures.map((figure) => ({ ...figure, inning })))
        .filter((figure) => figure.wickets !== null)
        .sort((a, b) => (b.wickets ?? 0) - (a.wickets ?? 0) || (a.runsConceded ?? 0) - (b.runsConceded ?? 0))
        .slice(0, 3),
    [match.innings],
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Top batting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {bestBatters.length ? (
            bestBatters.map((score) => (
              <div key={`${score.inning.id}-${score.playerId}`} className="flex items-center justify-between gap-4">
                <PlayerLine player={score.player} meta={score.inning.battingTeam.abbreviation ?? score.inning.battingTeam.name} />
                <p className="font-mono text-base tabular-nums">
                  {score.runs}
                  <span className="text-xs text-muted-foreground"> ({score.ballsFaced ?? 0})</span>
                </p>
              </div>
            ))
          ) : (
            <EmptyState title="No batting card yet" description="The scorecard does not include completed batting figures for this match." />
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Top bowling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {bestBowlers.length ? (
            bestBowlers.map((figure) => (
              <div key={`${figure.inning.id}-${figure.playerId}`} className="flex items-center justify-between gap-4">
                <PlayerLine player={figure.player} meta={`vs ${figure.inning.battingTeam.abbreviation ?? figure.inning.battingTeam.name}`} />
                <p className="font-mono text-base tabular-nums">
                  {figure.wickets ?? 0}/{figure.runsConceded ?? 0}
                  <span className="text-xs text-muted-foreground"> ({figure.overs ?? "0"})</span>
                </p>
              </div>
            ))
          ) : (
            <EmptyState title="No bowling card yet" description="The scorecard does not include completed bowling figures for this match." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryTab({ match }: { match: MatchDetail }) {
  const tossDecision = tossDecisionLabel(match.tossDecision);
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Toss" value={match.tossWinner ? `${match.tossWinner.name}${tossDecision ? `, ${tossDecision}` : ""}` : null} />
        <StatCard label="Match time" value={dateLabel(match.startAt)} />
      </div>
      <BestOfMatch match={match} />
    </div>
  );
}

function BattingTable({ rows }: { rows: BattingScore[] }) {
  if (!rows.length) return <EmptyState title="No batting data" description="This innings has no batting rows in the scorecard." />;
  return (
    <DataTable label="Batting scorecard" minWidth="min-w-245">
        <TableCaption className="sr-only">Batting scorecard for the selected innings</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Batter</TableHead>
            <TableHead className="text-right">Pos</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Dismissal</TableHead>
            <TableHead className="text-right">R</TableHead>
            <TableHead className="text-right">B</TableHead>
            <TableHead className="text-right">4s</TableHead>
            <TableHead className="text-right">6s</TableHead>
            <TableHead className="text-right">SR</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <PlayerLine player={row.player} meta={row.role} />
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">{row.position ?? "—"}</TableCell>
              <TableCell className="text-text-secondary">{row.isBatting ? "batting" : "completed"}</TableCell>
              <TableCell className="max-w-80 text-text-secondary">
                <p>{row.howOut ?? row.dismissal ?? "not out"}</p>
                {row.bowler || row.firstFielder || row.secondFielder || row.thirdFielder ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {row.bowler ? `Bowled by ${shortName(row.bowler)}` : null}
                    {[row.firstFielder, row.secondFielder, row.thirdFielder]
                      .filter((player): player is Player => Boolean(player))
                      .map((player) => ` · ${shortName(player)}`)
                      .join("")}
                  </p>
                ) : null}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">{numberLabel(row.runs)}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{numberLabel(row.ballsFaced)}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{numberLabel(row.fours)}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{numberLabel(row.sixes)}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{numberLabel(row.strikeRate, 2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
    </DataTable>
  );
}

function BowlingTable({ rows }: { rows: BowlingFigure[] }) {
  if (!rows.length) return <EmptyState title="No bowling data" description="This innings has no bowling rows in the scorecard." />;
  return (
    <DataTable label="Bowling scorecard" minWidth="min-w-160">
        <TableCaption className="sr-only">Bowling scorecard for the selected innings</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Bowler</TableHead>
            <TableHead className="text-right">Pos</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">O</TableHead>
            <TableHead className="text-right">M</TableHead>
            <TableHead className="text-right">R</TableHead>
            <TableHead className="text-right">W</TableHead>
            <TableHead className="text-right">NB</TableHead>
            <TableHead className="text-right">WD</TableHead>
            <TableHead className="text-right">Econ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <PlayerLine player={row.player} />
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">{row.position ?? "—"}</TableCell>
              <TableCell className="text-text-secondary">{row.isBowling ? "bowling" : "completed"}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{row.overs ?? "—"}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{numberLabel(row.maidens)}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{numberLabel(row.runsConceded)}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{numberLabel(row.wickets)}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{numberLabel(row.noBalls)}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{numberLabel(row.wides)}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{numberLabel(row.economy, 2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
    </DataTable>
  );
}

function ExtrasLine({ inning }: { inning: Inning }) {
  if (!inning.extras) return null;
  const extras = inning.extras;
  return (
    <p className="text-sm text-text-secondary">
      Extras: <span className="font-mono text-foreground">{extras.total ?? 0}</span>{" "}
      <span className="text-muted-foreground">
        (b {extras.byes ?? 0}, lb {extras.legByes ?? 0}, w {extras.wides ?? 0}, nb {extras.noBalls ?? 0}, p {extras.penalty ?? 0})
      </span>
    </p>
  );
}

function WicketsLine({ inning }: { inning: Inning }) {
  if (!inning.fallOfWickets.length) return <EmptyState title="No fall-of-wickets data" description="This innings has no wicket progression in the archive." />;
  return (
    <div className="flex flex-wrap gap-2">
      {inning.fallOfWickets.map((wicket) => (
        <span key={wicket.id} className="rounded-full border border-border bg-card px-3 py-1 text-xs text-text-secondary">
          {wicket.wicketNumber}: {wicket.scoreAtDismissal ?? wicket.runs ?? "—"}{" "}
          {wicket.oversAtDismissal ? `(${wicket.oversAtDismissal})` : ""}
          {wicket.balls !== null ? ` · ball ${wicket.balls}` : ""} {wicket.player ? shortName(wicket.player) : ""}
          {wicket.howOut ?? wicket.dismissal ? ` · ${wicket.howOut ?? wicket.dismissal}` : ""}
          {wicket.bowler ? ` · b ${shortName(wicket.bowler)}` : ""}
        </span>
      ))}
    </div>
  );
}

function FieldingLine({ rows }: { rows: FieldingFigure[] }) {
  const active = rows.filter(
    (row) =>
      row.substitute ||
      (row.catches ?? 0) + (row.runOutThrower ?? 0) + (row.runOutCatcher ?? 0) + (row.directHits ?? 0) + (row.stumpings ?? 0) > 0,
  );
  if (!active.length) return <EmptyState title="No fielding figures" description="No catches, run outs, stumpings, or substitute fielding rows are listed." />;
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {active.map((row) => (
        <div key={row.id} className="rounded-lg border border-border bg-card px-4 py-3 text-sm">
          <p className="font-medium">{row.player.name}</p>
          <p className="text-muted-foreground">
            Catches {row.catches ?? 0} · Run outs {(row.runOutThrower ?? 0) + (row.runOutCatcher ?? 0)} · Stumpings {row.stumpings ?? 0}
          </p>
          <p className="text-xs text-muted-foreground">
            Direct hits {row.directHits ?? 0} · {row.substitute ? "Substitute fielder" : "Regular fielder"}
          </p>
        </div>
      ))}
    </div>
  );
}

function ScorecardTab({ match }: { match: MatchDetail }) {
  const [inningId, setInningId] = useState(match.innings[0]?.id ?? 0);
  const inning = match.innings.find((item) => item.id === inningId) ?? match.innings[0];
  if (!inning) return <EmptyState title="No scorecard data" description="The scorecard endpoint did not return innings for this match." />;

  return (
    <div className="space-y-5">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {match.innings.map((item) => (
          <Button key={item.id} type="button" variant={item.id === inning.id ? "default" : "outline"} size="sm" onClick={() => setInningId(item.id)}>
            {item.battingTeam.abbreviation ?? item.battingTeam.name} {item.scores ?? ""}
          </Button>
        ))}
      </div>
      <section className="space-y-4">
        <div>
          <h2 className="font-heading text-2xl">{inning.name ?? `${inning.battingTeam.name} innings`}</h2>
          <p className="text-sm text-muted-foreground">
            {inning.scores ?? "—"} {inning.overs ? `(${inning.overs})` : ""} {inning.target ? `· Target ${inning.target}` : ""}
            {inning.isSuperOver ? " · Super over" : ""}
            {inning.status !== null ? ` · Status ${inning.status}` : ""}
            {inning.result !== null ? ` · Result ${inning.result}` : ""}
          </p>
        </div>
        <BattingTable rows={inning.battingScores} />
        <ExtrasLine inning={inning} />
        <BowlingTable rows={inning.bowlingFigures} />
        <div className="space-y-2">
          <h3 className="font-heading text-xl">Fall of wickets</h3>
          <WicketsLine inning={inning} />
        </div>
        <div className="space-y-2">
          <h3 className="font-heading text-xl">Fielding</h3>
          <FieldingLine rows={inning.fieldingFigures} />
        </div>
      </section>
    </div>
  );
}

function eventBallLabel(event: CommentaryEvent) {
  if (event.sourceOver === null || event.sourceBall === null) return `#${event.sequenceNo}`;
  return `${event.sourceOver}.${event.sourceBall}`;
}

function eventRunsLabel(event: CommentaryEvent) {
  if (event.isWicket) return "W";
  if (event.isSix) return "6";
  if (event.isFour) return "4";
  return String(event.totalRuns ?? event.batRuns ?? 0);
}

function CommentaryTab({ commentary }: { commentary: CommentaryEvent[] }) {
  const innings = useMemo(() => [...new Set(commentary.map((event) => event.inning.number))], [commentary]);
  const [inning, setInning] = useState<string>("all");
  const [filter, setFilter] = useState<CommentaryFilter>("all");

  const filtered = commentary.filter((event) => {
    if (inning !== "all" && event.inning.number !== Number(inning)) return false;
    if (filter === "wickets") return Boolean(event.isWicket);
    if (filter === "boundaries") return Boolean(event.isFour || event.isSix);
    return true;
  });

  const groups = filtered.reduce<{ key: string; label: string; events: CommentaryEvent[] }[]>((items, event) => {
    const key = `${event.inning.number}-${event.sourceOver ?? "event"}`;
    const found = items.find((item) => item.key === key);
    if (found) found.events.push(event);
    else items.push({ key, label: event.sourceOver === null ? event.inning.name ?? "Events" : `Over ${event.sourceOver}`, events: [event] });
    return items;
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant={inning === "all" ? "default" : "outline"} size="sm" onClick={() => setInning("all")}>
          All innings
        </Button>
        {innings.map((number) => (
          <Button key={number} type="button" variant={inning === String(number) ? "default" : "outline"} size="sm" onClick={() => setInning(String(number))}>
            Innings {number}
          </Button>
        ))}
        {(["all", "wickets", "boundaries"] as const).map((item) => (
          <Button key={item} type="button" variant={filter === item ? "secondary" : "ghost"} size="sm" onClick={() => setFilter(item)}>
            {item}
          </Button>
        ))}
      </div>
      {groups.length ? (
        <div className="space-y-4">
          {groups.map((group) => (
            <section key={group.key} className="rounded-lg border border-border bg-card">
              <h2 className="border-b border-border px-4 py-2 font-heading text-lg">{group.label}</h2>
              <div className="divide-y divide-border">
                {group.events.map((event) => (
                  <article key={event.id} className="grid gap-3 px-4 py-3 sm:grid-cols-[80px_44px_1fr]">
                    <p className="font-mono text-sm text-muted-foreground tabular-nums">{eventBallLabel(event)}</p>
                    <span
                      className={cn(
                        "inline-flex size-8 items-center justify-center rounded-full border border-border bg-background font-mono text-sm",
                        event.isWicket && "border-danger text-danger",
                        (event.isFour || event.isSix) && "border-primary text-primary",
                      )}
                    >
                      {eventRunsLabel(event)}
                    </span>
                    <div className="min-w-0">
                      <p className="wrap-break-word text-sm">{event.commentary ?? event.detailText ?? event.eventType}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {shortName(event.batter)} vs {shortName(event.bowler)}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState title="No commentary for this filter" description="Try a broader innings or event filter." />
      )}
    </div>
  );
}

const WAGON_SOURCE_SIZE = 363;
const WAGON_SOURCE_CENTER = WAGON_SOURCE_SIZE / 2;
const WAGON_VIEW_CENTER = 200;
const WAGON_BOUNDARY_RADIUS = 178;

function wagonPoint(shot: WagonShot) {
  const sourceX = shot.x ?? WAGON_SOURCE_CENTER;
  const sourceY = shot.y ?? WAGON_SOURCE_CENTER;
  const dx = (sourceX - WAGON_SOURCE_CENTER) / WAGON_SOURCE_CENTER;
  const dy = (WAGON_SOURCE_CENTER - sourceY) / WAGON_SOURCE_CENTER;
  const distance = Math.hypot(dx, dy);
  const scale = distance > 1 ? 1 / distance : 1;
  return {
    x: WAGON_VIEW_CENTER + dx * scale * WAGON_BOUNDARY_RADIUS,
    y: WAGON_VIEW_CENTER + dy * scale * WAGON_BOUNDARY_RADIUS,
  };
}

function WagonGround({ shots }: { shots: WagonShot[] }) {
  const plotted = shots.filter((shot) => shot.x !== null && shot.y !== null);
  return (
    <svg
      viewBox="0 0 400 400"
      role="img"
      aria-label="Historical wagon wheel shot plot"
      className="mx-auto h-auto w-full max-w-130 overflow-visible"
    >
      <defs>
        <clipPath id="wagon-boundary">
          <circle cx={WAGON_VIEW_CENTER} cy={WAGON_VIEW_CENTER} r={WAGON_BOUNDARY_RADIUS} />
        </clipPath>
      </defs>
      <circle cx={WAGON_VIEW_CENTER} cy={WAGON_VIEW_CENTER} r="190" fill="var(--surface)" stroke="var(--border)" strokeWidth="1" />
      <circle cx={WAGON_VIEW_CENTER} cy={WAGON_VIEW_CENTER} r={WAGON_BOUNDARY_RADIUS} fill="color-mix(in srgb, var(--success) 12%, var(--surface))" stroke="var(--border-strong)" strokeWidth="2" />
      <circle cx={WAGON_VIEW_CENTER} cy={WAGON_VIEW_CENTER} r="142" fill="none" stroke="var(--border)" strokeDasharray="5 6" />
      <circle cx={WAGON_VIEW_CENTER} cy={WAGON_VIEW_CENTER} r="88" fill="none" stroke="var(--border)" strokeOpacity="0.8" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const radians = (angle * Math.PI) / 180;
        return (
          <line
            key={angle}
            x1={WAGON_VIEW_CENTER}
            y1={WAGON_VIEW_CENTER}
            x2={WAGON_VIEW_CENTER + Math.cos(radians) * WAGON_BOUNDARY_RADIUS}
            y2={WAGON_VIEW_CENTER + Math.sin(radians) * WAGON_BOUNDARY_RADIUS}
            stroke="var(--border)"
            strokeWidth="0.75"
            strokeOpacity="0.6"
          />
        );
      })}
      <g clipPath="url(#wagon-boundary)">
        {plotted.map((shot) => {
          const { x, y } = wagonPoint(shot);
          const runs = shot.batRuns ?? shot.teamRuns ?? 0;
          return (
            <line
              key={shot.id}
              x1={WAGON_VIEW_CENTER}
              y1={WAGON_VIEW_CENTER}
              x2={x}
              y2={y}
              stroke={runs >= 6 ? "var(--danger)" : runs >= 4 ? "var(--brand)" : "var(--text-secondary)"}
              strokeWidth={runs >= 6 ? 3 : runs >= 4 ? 2.4 : runs === 0 ? 0.8 : 1.25}
              strokeOpacity={runs >= 4 ? 0.82 : runs === 0 ? 0.18 : 0.42}
              strokeLinecap="round"
            >
              <title>{`${shot.batter?.name ?? "Unknown batter"} · ${runs} runs · ${shot.zoneName ?? "Unknown zone"}`}</title>
            </line>
          );
        })}
      </g>
      <rect x="189" y="170" width="22" height="60" rx="3" fill="var(--surface)" stroke="var(--border-strong)" />
      <line x1="184" y1="180" x2="216" y2="180" stroke="var(--border-strong)" strokeWidth="1" />
      <line x1="184" y1="220" x2="216" y2="220" stroke="var(--border-strong)" strokeWidth="1" />
      <circle cx={WAGON_VIEW_CENTER} cy={WAGON_VIEW_CENTER} r="4" fill="var(--brand)" />
      {plotted.map((shot) => {
        const { x, y } = wagonPoint(shot);
        const runs = shot.batRuns ?? shot.teamRuns ?? 0;
        if (runs < 4) return null;
        return (
          <circle key={`marker-${shot.id}`} cx={x} cy={y} r={runs >= 6 ? 4 : 3} fill={runs >= 6 ? "var(--danger)" : "var(--brand)"}>
            <title>{`${shot.batter?.name ?? "Unknown batter"} · ${runs} runs · ${shot.zoneName ?? "Unknown zone"}`}</title>
          </circle>
        );
      })}
    </svg>
  );
}

function WagonWheelTab({ shots }: { shots: WagonShot[] }) {
  const [inning, setInning] = useState("all");
  const [batter, setBatter] = useState("all");
  const [runs, setRuns] = useState("all");
  const [zone, setZone] = useState("all");
  const innings = [...new Set(shots.map((shot) => shot.inning.number))];
  const batters = [...new Map(
    shots
      .filter((shot) => shot.batter)
      .map((shot) => [shot.batter?.id, shot.batter]),
  ).values()].filter((player): player is Player => Boolean(player));
  const zones = [...new Set(shots.map((shot) => shot.zoneName).filter(Boolean))] as string[];
  const filtered = shots.filter((shot) => {
    if (inning !== "all" && shot.inning.number !== Number(inning)) return false;
    if (batter !== "all" && shot.batter?.id !== Number(batter)) return false;
    if (runs !== "all" && (shot.batRuns ?? shot.teamRuns) !== Number(runs)) return false;
    if (zone !== "all" && shot.zoneName !== zone) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-primary/25 bg-[color-mix(in_srgb,var(--brand)_7%,var(--surface))] px-4 py-3 text-sm text-text-secondary">
        Historical shot analysis from archived match data. This is not live match data.
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="grid gap-1 text-sm font-medium">
          Innings
          <Select value={inning} onValueChange={setInning}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All innings</SelectItem>
              {innings.map((value) => <SelectItem key={value} value={String(value)}>Innings {value}</SelectItem>)}
            </SelectContent>
          </Select>
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Batter
          <Select value={batter} onValueChange={setBatter}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All batters</SelectItem>
              {batters.map((player) => <SelectItem key={player.id} value={String(player.id)}>{player.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Bat runs
          <Select value={runs} onValueChange={setRuns}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All run values</SelectItem>
              {[0, 1, 2, 3, 4, 6].map((value) => <SelectItem key={value} value={String(value)}>{value} runs</SelectItem>)}
            </SelectContent>
          </Select>
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Field zone
          <Select value={zone} onValueChange={setZone}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All zones</SelectItem>
              {zones.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}
            </SelectContent>
          </Select>
        </label>
      </div>
      {filtered.length ? (
        <>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
            <WagonGround shots={filtered} />
            <div className="space-y-3 rounded-lg border border-border bg-card p-4 text-sm">
              <p className="font-medium">{filtered.length} archived shots</p>
              <p className="text-text-secondary">Lines start at the batter and use archived x/y shot coordinates.</p>
              <p className="text-text-secondary"><span className="text-primary">Orange</span> = four · <span className="text-danger">Red</span> = six · grey = other.</p>
            </div>
          </div>
          <DataTable label="Wagon wheel shot list" minWidth="min-w-180">
            <TableCaption className="sr-only">Filtered wagon wheel shots for the selected match</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Innings</TableHead>
                <TableHead>Batter</TableHead>
                <TableHead className="text-right">Runs</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Event</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.slice(0, 50).map((shot) => (
                <TableRow key={shot.id}>
                  <TableCell>{shot.inning.number} · {shot.sourceOver ?? "—"}</TableCell>
                  <TableCell>{shot.batter?.name ?? "Unknown"}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{shot.batRuns ?? shot.teamRuns ?? 0}</TableCell>
                  <TableCell>{shot.zoneName ?? "—"}</TableCell>
                  <TableCell className="text-text-secondary">{shot.eventName ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </DataTable>
        </>
      ) : <EmptyState title="No archived shots match these filters" description="Try all innings, batters, run values, or field zones." />}
    </div>
  );
}

function SnapshotList({ title, rows, bowler }: { title: string; rows: import("./types").SnapshotPlayer[]; bowler?: boolean }) {
  if (!rows.length) return null;
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {rows.map((row, index) => (
          <div key={`${row.name ?? "player"}-${index}`} className="flex items-center justify-between gap-3 text-sm">
            <span>{row.name ?? "Unknown"}</span>
            <span className="font-mono text-text-secondary">
              {bowler ? `${row.overs ?? "—"} · ${row.wickets ?? 0}/${row.runs_conceded ?? 0}` : `${row.runs ?? 0} (${row.balls_faced ?? 0})`}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function HistoricalSnapshotTab({ snapshot }: { snapshot: HistoricalSnapshotResponse | null }) {
  if (!snapshot) return <EmptyState title="No archived historical snapshot" description="The historical snapshot endpoint did not return a saved state for this match." />;
  const data = snapshot.payload;
  const score = data.live_score;
  const partnership = data.current_partnership;
  const reviews = [data.review?.batting, data.review?.bowling].filter(Boolean);
  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-primary/25 bg-[color-mix(in_srgb,var(--brand)_7%,var(--surface))] px-4 py-3 text-sm text-text-secondary">
        Archived completed-match snapshot. Captured historical state, not live scoring or realtime refresh.
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Snapshot score" value={score ? `${score.runs ?? 0}/${score.wickets ?? 0}` : null} />
        <StatCard label="Overs / run rate" value={score ? `${score.overs ?? "—"} · ${score.runrate ?? "—"}` : null} />
        <StatCard label="Target / required rate" value={score ? `${score.target ?? "—"} · ${score.required_runrate ?? "—"}` : null} />
        <StatCard label="Teams" value={[data.team_batting, data.team_bowling].filter(Boolean).join(" vs ") || null} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <SnapshotList title="Batsmen at snapshot" rows={data.batsmen ?? []} />
        <SnapshotList title="Bowlers at snapshot" rows={data.bowlers ?? []} bowler />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Partnership" value={partnership ? `${partnership.runs ?? 0} runs · ${partnership.balls ?? 0} balls` : null} />
        <StatCard label="Recent scores" value={data.recent_scores ?? null} />
        <StatCard label="Last five overs" value={data.last_five_overs ?? null} />
        <StatCard label="Last ten overs" value={data.last_ten_overs ?? null} />
      </div>
      {data.last_wicket ? (
        <Card>
          <CardHeader><CardTitle>Last wicket</CardTitle></CardHeader>
          <CardContent className="text-sm text-text-secondary">
            {data.last_wicket.name ?? "Unknown"} · {data.last_wicket.runs ?? 0} ({data.last_wicket.balls ?? 0}) · {data.last_wicket.how_out ?? data.last_wicket.dismissal ?? "—"}
            {data.last_wicket.overs_at_dismissal ? ` · ${data.last_wicket.overs_at_dismissal}` : ""}
          </CardContent>
        </Card>
      ) : null}
      {reviews.length || data.powerplay?.length ? (
        <Card>
          <CardHeader><CardTitle>Reviews and powerplay</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-text-secondary">
            {reviews.map((review, index) => <p key={index}>Review {index === 0 ? "batting" : "bowling"}: {Object.entries(review ?? {}).map(([key, value]) => `${key.replaceAll("_", " ")} ${value}`).join(" · ")}</p>)}
            {data.powerplay?.length ? <p>Powerplay entries: {JSON.stringify(data.powerplay)}</p> : null}
          </CardContent>
        </Card>
      ) : null}
      <p className="text-xs text-muted-foreground">Source: {snapshot.sourceFile.relativePath}</p>
    </div>
  );
}

function PlayingXiTab({ match }: { match: MatchDetail }) {
  const teamPlayers = (teamId: number) =>
    match.playingXi
      .filter((row) => row.team.id === teamId)
      .sort((a, b) => (a.battingOrder ?? 99) - (b.battingOrder ?? 99) || a.player.name.localeCompare(b.player.name));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {[match.teamA, match.teamB].map((team) => (
        <Card key={team.id}>
          <CardHeader>
            <CardTitle>{team.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <XiList rows={teamPlayers(team.id)} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function XiList({ rows }: { rows: MatchPlayingXi[] }) {
  if (!rows.length) return <EmptyState title="No playing XI listed" description="The match archive does not include a playing XI for this team." />;
  return (
    <ol className="space-y-3">
      {rows.map((row) => (
        <li key={row.id} className="flex gap-3">
          <span className="mt-0.5 w-6 shrink-0 font-mono text-xs text-muted-foreground tabular-nums">{row.battingOrder ?? "—"}</span>
          <div className="min-w-0 flex-1">
            <PlayerLine player={row.player} meta={row.player.playingRole} />
          </div>
          {row.isDidNotBat ? <span className="text-xs text-muted-foreground">DNB</span> : null}
        </li>
      ))}
    </ol>
  );
}

function InfoTab({ match }: { match: MatchDetail }) {
  const tossDecision = tossDecisionLabel(match.tossDecision);
  const officials = officialGroups(match.officials);
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <div className="grid gap-3">
        <StatCard label="Match" value={match.title} />
        <StatCard label="Competition" value={match.subtitle} />
        <StatCard label="Match number" value={match.matchNumber} />
        <StatCard label="Format" value={match.format} />
        <StatCard label="Start" value={dateLabel(match.startAt)} />
        <StatCard label="End" value={match.endAt ? dateLabel(match.endAt) : null} />
        <StatCard label="Toss" value={match.tossWinner ? `${match.tossWinner.name}${tossDecision ? `, ${tossDecision}` : ""}` : null} />
      </div>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Venue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-text-secondary">
            {match.venue ? (
              <Link
                href={`/venues/${match.venue.id}`}
                className="block rounded-sm text-foreground underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <p className="font-medium">{match.venue.name}</p>
                <p>{[match.venue.location, match.venue.country].filter(Boolean).join(", ") || "—"}</p>
              </Link>
            ) : (
              <p>—</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Officials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {officials.length ? (
              officials.map((official) => (
                <div key={official.label} className="grid gap-1 rounded-lg bg-background px-3 py-2 text-sm sm:grid-cols-[140px_minmax(0,1fr)]">
                  <span className="text-muted-foreground">{official.label}</span>
                  <span className="wrap-break-word font-medium sm:text-right">{official.names.join(", ")}</span>
                </div>
              ))
            ) : (
              <EmptyState title="No officials listed" description="The match archive does not include officiating details." />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function sentenceLabel(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

function officialGroups(officials: MatchOfficial[]) {
  const sorted = [...officials].sort((a, b) => a.position - b.position);
  const umpires = sorted.filter((official) => official.role.toLowerCase().includes("umpire"));
  const referees = sorted.filter((official) => official.role.toLowerCase().includes("referee"));
  const others = sorted.filter(
    (official) =>
      !official.role.toLowerCase().includes("umpire") &&
      !official.role.toLowerCase().includes("referee"),
  );
  const groups: { label: string; names: string[] }[] = [];
  const tvUmpire = umpires.find((official) => official.isTvUmpire);
  const nonTvUmpires = umpires.filter((official) => !official.isTvUmpire);
  const onField = nonTvUmpires.slice(0, 2);
  const fourth = nonTvUmpires.slice(2);

  if (onField.length) groups.push({ label: "On-field umpires", names: onField.map((official) => official.name) });
  if (tvUmpire) groups.push({ label: "TV umpire", names: [tvUmpire.name] });
  if (fourth.length) groups.push({ label: "Fourth umpire", names: fourth.map((official) => official.name) });
  if (referees.length) groups.push({ label: "Match referee", names: referees.map((official) => official.name) });
  groups.push(...others.map((official) => ({ label: sentenceLabel(official.role), names: [official.name] })));

  return groups;
}

function awardPlayer(match: MatchDetail, pattern: RegExp) {
  const award = match.awards.find((item) => pattern.test(item.awardType));
  return award?.player ?? null;
}

function HeroFacts({ match }: { match: MatchDetail }) {
  const playerOfMatch = match.playerOfMatch ?? awardPlayer(match, /player.*match|match.*player/i);
  const playerOfSeries = awardPlayer(match, /series/i);
  if (!playerOfMatch && !playerOfSeries) return null;

  return (
    <div className={cn("mt-5 grid gap-3", playerOfMatch && playerOfSeries && "sm:grid-cols-2")}>
      {playerOfMatch ? <PlayerFact label="Player of match" player={playerOfMatch} /> : null}
      {playerOfSeries ? <PlayerFact label="Player of series" player={playerOfSeries} /> : null}
    </div>
  );
}

export function MatchDetailView({
  match,
  commentary,
  wagonWheel,
  historicalSnapshot,
}: {
  match: MatchDetail;
  commentary: CommentaryEvent[];
  wagonWheel: WagonShot[];
  historicalSnapshot: HistoricalSnapshotResponse | null;
}) {
  const [tab, setTab] = useState<TabId>("summary");
  const result = match.statusNote ?? match.winMargin ?? match.statusText;

  return (
    <div className="space-y-8">
      <header className="aiko-match-hero rounded-xl border border-border bg-card px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-2 border-b border-border pb-4">
          <p className="text-sm text-muted-foreground">{[match.subtitle, match.matchNumber, match.format].filter(Boolean).join(" · ")}</p>
          <h1 className="wrap-break-word font-heading text-3xl leading-tight text-foreground sm:text-4xl">{match.shortTitle ?? match.title}</h1>
          <p className="text-sm text-text-secondary">{[dateLabel(match.startAt), match.venue?.name].filter(Boolean).join(" · ")}</p>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          <TeamScore match={match} team={match.teamA} />
          <TeamScore match={match} team={match.teamB} />
        </div>
        {result ? <p className="mt-5 rounded-lg bg-muted px-4 py-3 text-sm font-medium text-foreground">{result}</p> : null}
        <HeroFacts match={match} />
      </header>

      <div className="sticky top-14 z-30 -mx-6 border-y border-border bg-background/95 px-6 py-2 backdrop-blur">
        <div className="flex gap-2 overflow-x-auto">
          {TABS.map((item) => (
            <Button key={item.id} type="button" variant={tab === item.id ? "default" : "ghost"} size="sm" onClick={() => setTab(item.id)}>
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      <main className="min-w-0">
        <div key={tab} className="aiko-tab-panel">
          {tab === "summary" ? <SummaryTab match={match} /> : null}
          {tab === "scorecard" ? <ScorecardTab match={match} /> : null}
          {tab === "commentary" ? <CommentaryTab commentary={commentary} /> : null}
          {tab === "wagon-wheel" ? <WagonWheelTab shots={wagonWheel} /> : null}
          {tab === "history" ? <HistoricalSnapshotTab snapshot={historicalSnapshot} /> : null}
          {tab === "xi" ? <PlayingXiTab match={match} /> : null}
          {tab === "info" ? <InfoTab match={match} /> : null}
        </div>
      </main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { EntityImage } from "@/components/entity-image";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { fetchTeams } from "./api";
import type { TeamSummary } from "./types";

function TeamMark({ team }: { team: TeamSummary }) {
  const image = team.logoUrl ?? team.thumbnailUrl;
  return (
    <EntityImage
      kind="team"
      src={image}
      alt=""
      width={64}
      height={64}
      className="size-16 rounded-full"
      imageClassName="object-contain p-2"
    />
  );
}

function TeamCard({ team }: { team: TeamSummary }) {
  return (
    <Link
      href={`/teams/${team.id}`}
      className="flex min-w-0 items-center gap-4 rounded-lg border border-border bg-card px-4 py-4 transition-[background-color,border-color,transform] duration-[120ms] ease-[var(--ease-out)] hover:-translate-y-px hover:border-border-strong hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <TeamMark team={team} />
      <div className="min-w-0">
        <h2 className="wrap-break-word font-heading text-2xl leading-tight text-foreground">{team.name}</h2>
        <p className="mt-1 wrap-break-word text-sm text-text-secondary">
          {[team.abbreviation, team.country].filter(Boolean).join(" · ") || "Team"}
        </p>
      </div>
    </Link>
  );
}

export function TeamsView({ teams: initialTeams }: { teams: TeamSummary[] }) {
  const { data: teams = initialTeams } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const res = await fetchTeams();
      return res.data;
    },
    initialData: initialTeams,
  });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="IPL 2022 · Franchise Directory"
        title="IPL 2022 Teams"
        subtitle={`${teams.length} franchises competing in the 15th edition`}
      />

      {teams.length ? (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => <TeamCard key={team.id} team={team} />)}
        </section>
      ) : (
        <EmptyState title="No teams available" description="The IPL 2022 franchise directory returned no records." />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/page-header";
import { fetchTeams } from "./api";
import type { TeamSummary } from "./types";

function TeamMark({ team }: { team: TeamSummary }) {
  const [failed, setFailed] = useState(false);
  const image = team.logoUrl ?? team.thumbnailUrl;
  return (
    <span className="inline-flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-lg font-medium text-muted-foreground">
      {image && !failed ? (
        <Image
          src={image}
          alt=""
          width={64}
          height={64}
          unoptimized
          className="size-full object-contain p-2"
          onError={() => setFailed(true)}
        />
      ) : (
        team.abbreviation?.slice(0, 3) ?? team.name.slice(0, 2)
      )}
    </span>
  );
}

function TeamCard({ team }: { team: TeamSummary }) {
  return (
    <Link
      href={`/teams/${team.id}`}
      className="flex min-w-0 items-center gap-4 rounded-lg border border-border bg-card px-4 py-4 transition-[background-color,border-color,transform] duration-120 ease-out hover:-translate-y-px hover:border-border-strong hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
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
        <p className="rounded-lg border border-dashed border-border px-4 py-8 text-sm text-text-secondary">
          No teams available.
        </p>
      )}
    </div>
  );
}

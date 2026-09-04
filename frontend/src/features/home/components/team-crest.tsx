"use client";

import { EntityImage } from "@/components/entity-image";
import { cn } from "@/lib/utils";
import type { TeamCard } from "../types";

interface TeamCrestProps {
  team: TeamCard;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_MAP = {
  sm: { px: 24, cls: "size-6" },
  md: { px: 32, cls: "size-8" },
  lg: { px: 44, cls: "size-11" },
};

export function TeamCrest({ team, size = "md", className }: TeamCrestProps) {
  const src = team.logoUrl ?? team.thumbnailUrl;
  const { px, cls } = SIZE_MAP[size];

  return (
    <EntityImage
      kind="team"
      src={src}
      alt={team.abbreviation ?? team.name}
      width={px}
      height={px}
      className={cn("rounded-md border border-border", cls, className)}
      imageClassName="object-contain p-0.5"
    />
  );
}

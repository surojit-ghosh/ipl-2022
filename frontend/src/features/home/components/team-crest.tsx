"use client";

import Image from "next/image";
import { useState } from "react";
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
  const [failed, setFailed] = useState(false);
  const src = team.logoUrl ?? team.thumbnailUrl;
  const { px, cls } = SIZE_MAP[size];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md bg-muted border border-border font-mono font-semibold text-muted-foreground",
        cls,
        className,
      )}
      style={{ fontSize: px * 0.32 }}
    >
      {src && !failed ? (
        <Image
          src={src}
          alt={team.abbreviation ?? team.name}
          width={px}
          height={px}
          unoptimized
          className="size-full object-contain p-0.5"
          onError={() => setFailed(true)}
        />
      ) : (
        <span>{team.abbreviation?.slice(0, 3) ?? team.name.slice(0, 2)}</span>
      )}
    </span>
  );
}
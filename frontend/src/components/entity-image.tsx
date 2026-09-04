"use client";

import { useState } from "react";
import Image from "next/image";
import { Shield, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

const FALLBACK_ICON = {
  player: UserRound,
  team: Shield,
} as const;

type EntityImageProps = {
  kind: keyof typeof FALLBACK_ICON;
  src?: string | null;
  alt?: string;
  width: number;
  height: number;
  className?: string;
  imageClassName?: string;
  loading?: "eager" | "lazy";
};

export function EntityImage({
  kind,
  src,
  alt = "",
  width,
  height,
  className,
  imageClassName,
  loading = "lazy",
}: EntityImageProps) {
  const [failed, setFailed] = useState(false);
  const Icon = FALLBACK_ICON[kind];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden bg-muted text-muted-foreground ring-1 ring-border/70",
        className,
      )}
    >
      {src && !failed ? (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          unoptimized
          loading={loading}
          decoding="async"
          className={cn("size-full", imageClassName)}
          onError={() => setFailed(true)}
        />
      ) : (
        <Icon aria-hidden="true" className="size-[58%] stroke-[1.7]" />
      )}
    </span>
  );
}

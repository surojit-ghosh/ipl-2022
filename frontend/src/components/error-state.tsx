import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function ErrorState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border border-destructive/35 bg-[color-mix(in_srgb,var(--semantic-negative)_8%,var(--bg-surface))] px-5 py-4 text-sm text-text-secondary",
        className,
      )}
    >
      <p className="font-display text-lg font-medium text-foreground">{title}</p>
      {description ? <div className="mt-1">{description}</div> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

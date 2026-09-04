import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function EmptyState({
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
      className={cn(
        "rounded-lg border border-dashed border-border bg-card/45 px-5 py-8 text-sm text-text-secondary",
        className,
      )}
    >
      <p className="font-display text-lg font-medium text-foreground">{title}</p>
      {description ? <div className="mt-1 max-w-2xl">{description}</div> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

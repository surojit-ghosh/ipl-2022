import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  detail,
  tone = "default",
  className,
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  tone?: "default" | "primary" | "gold" | "success" | "danger";
  className?: string;
}) {
  const tones = {
    default: "before:bg-border-strong",
    primary: "before:bg-primary",
    gold: "before:bg-secondary",
    success: "before:bg-success",
    danger: "before:bg-danger",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-border bg-card px-4 py-3 before:absolute before:inset-y-3 before:left-0 before:w-px",
        tones[tone],
        className,
      )}
    >
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 min-w-0 wrap-break-word font-mono text-xl font-semibold tabular-nums text-foreground">
        {value ?? "-"}
      </p>
      {detail ? <p className="mt-1 text-xs text-muted-foreground">{detail}</p> : null}
    </div>
  );
}

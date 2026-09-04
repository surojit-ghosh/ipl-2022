import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  eyebrow?: ReactNode;
  title: string;
  subtitle?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow = "IPL 2022 · TATA IPL 15th Edition · Archive",
  title,
  subtitle,
  children,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-2.5 flex items-center gap-2">
            <span className="aiko-live-pulse inline-block size-1.5 rounded-full bg-primary" />
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              {eyebrow}
            </span>
          </div>
        )}
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 font-mono text-sm text-muted-foreground tabular-nums">
            {subtitle}
          </p>
        )}
      </div>

      {children && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {children}
        </div>
      )}
    </header>
  );
}
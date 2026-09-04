import * as React from "react";

import { cn } from "@/lib/utils";

export type ChartConfig = Record<
  string,
  {
    label: string;
    color?: string;
  }
>;

function ChartContainer({
  config,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { config: ChartConfig }) {
  const style = Object.fromEntries(
    Object.entries(config).flatMap(([key, item]) =>
      item.color ? [[`--color-${key}`, item.color]] : [],
    ),
  ) as React.CSSProperties;

  return (
    <div
      data-slot="chart"
      className={cn("min-w-0 text-sm text-muted-foreground [&_svg]:max-w-full", className)}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}

function ChartLegend({
  config,
  className,
}: {
  config: ChartConfig;
  className?: string;
}) {
  return (
    <dl className={cn("flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground", className)}>
      {Object.entries(config).map(([key, item]) => (
        <div key={key} className="flex items-center gap-2">
          <dt
            className="size-2.5 rounded-[3px]"
            style={{ backgroundColor: item.color ?? `var(--color-${key})` }}
            aria-hidden="true"
          />
          <dd>{item.label}</dd>
        </div>
      ))}
    </dl>
  );
}

export { ChartContainer, ChartLegend };

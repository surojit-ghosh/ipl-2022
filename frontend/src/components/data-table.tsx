import type { ReactNode } from "react";

import { Table } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export function DataTableFrame({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="mb-2 text-xs text-muted-foreground" id={`${label.replace(/\W+/g, "-").toLowerCase()}-scroll-note`}>
        Scroll horizontally to inspect all columns.
      </p>
      <div
        role="region"
        aria-label={label}
        tabIndex={0}
        className="overflow-x-auto rounded-lg border border-border bg-card focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
      >
        {children}
      </div>
    </div>
  );
}

export function DataTable({
  label,
  minWidth,
  children,
}: {
  label: string;
  minWidth: string;
  children: ReactNode;
}) {
  return (
    <DataTableFrame label={label}>
      <Table className={cn("text-sm", minWidth)}>
        {children}
      </Table>
    </DataTableFrame>
  );
}

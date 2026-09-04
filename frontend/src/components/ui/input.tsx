import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(
        "flex min-h-11 w-full min-w-0 rounded-lg border border-input bg-card px-3 py-2 text-base text-foreground outline-none transition-[border-color,box-shadow,background-color] duration-[120ms] ease-[var(--ease-out)] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/45 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/25 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Input };

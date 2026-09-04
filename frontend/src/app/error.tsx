"use client";

import { RotateCcw } from "lucide-react";

import { ErrorState } from "@/components/error-state";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  void error;

  return (
    <ErrorState
      title="Could not load this page"
      description="Something went wrong while loading this Aiko view."
      action={
        <Button type="button" onClick={reset}>
          <RotateCcw aria-hidden className="size-4" />
          Try again
        </Button>
      }
    />
  );
}

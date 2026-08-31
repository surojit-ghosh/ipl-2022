"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  void error;

  return (
    <div role="alert" className="flex min-h-48 flex-col justify-center gap-3">
      <p className="font-medium text-destructive">Could not load this page</p>
      <p className="text-sm text-text-secondary">
        Something went wrong while loading this page.
      </p>
      <button
        type="button"
        className="w-fit text-sm text-primary underline-offset-4 hover:underline"
        onClick={reset}
      >
        Try again
      </button>
    </div>
  );
}

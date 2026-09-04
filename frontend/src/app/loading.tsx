export default function Loading() {
  return (
    <div className="space-y-8" role="status" aria-busy="true">
      <span className="sr-only">Loading page</span>
      <div className="space-y-3" aria-hidden="true">
        <div className="h-3 w-44 animate-pulse rounded bg-muted/60" />
        <div className="h-10 w-full max-w-xl animate-pulse rounded bg-muted/80" />
        <div className="h-4 w-full max-w-2xl animate-pulse rounded bg-muted/50" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-lg border border-border bg-card/60 p-4">
            <div className="h-3 w-24 animate-pulse rounded bg-muted/70" />
            <div className="mt-6 h-5 w-3/4 animate-pulse rounded bg-muted/80" />
            <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-muted/60" />
          </div>
        ))}
      </div>
    </div>
  );
}

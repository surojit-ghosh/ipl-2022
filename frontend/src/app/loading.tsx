export default function Loading() {
  return (
    <div className="flex flex-col gap-8" role="status" aria-busy="true">
      <span className="sr-only">Loading page</span>
      <div className="h-9 w-40 bg-muted" aria-hidden="true" />
      <div className="divide-y divide-border" aria-hidden="true">
        <div className="h-28" />
        <div className="h-28" />
        <div className="h-28" />
      </div>
    </div>
  );
}

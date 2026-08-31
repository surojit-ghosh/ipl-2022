import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-64 flex-col items-start justify-center gap-3">
      <p className="text-sm text-muted-foreground">404</p>
      <h1 className="font-heading text-3xl text-foreground">Page not found</h1>
      <p className="text-sm text-text-secondary">The requested Aiko page does not exist.</p>
      <Link
        href="/"
        className="text-sm text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Return to matches
      </Link>
    </div>
  );
}

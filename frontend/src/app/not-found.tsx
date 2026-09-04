import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <EmptyState
      title="Page not found"
      description="The requested Aiko page does not exist."
      action={
        <Button asChild>
          <Link href="/">
            <ArrowLeft aria-hidden className="size-4" />
            Return to matches
          </Link>
        </Button>
      }
    />
  );
}

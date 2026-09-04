"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronUp, Menu, RadioTower } from "lucide-react";
import { useLenis } from "lenis/react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Matches" },
  { href: "/standings", label: "Standings" },
  { href: "/stats", label: "Stats" },
  { href: "/players", label: "Players" },
  { href: "/teams", label: "Teams" },
  { href: "/venues", label: "Venues" },
] as const;

const STICKY_AFTER = 48;

function navActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="flex flex-col md:flex-row md:flex-1 md:items-center md:justify-end">
      {NAV.map((item) => {
        const active = navActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => onNavigate?.()}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-11 items-center px-5 text-sm font-medium transition-colors duration-[120ms] ease-[var(--ease-out)] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none",
              active ? "text-primary" : "text-text-secondary hover:text-primary",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const lenis = useLenis();
  const [menuOpen, setMenuOpen] = useState(false);
  const [docked, setDocked] = useState(false);

  useEffect(() => {
    const onScroll = () => setDocked(window.scrollY >= STICKY_AFTER);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-full">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-secondary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-secondary-foreground"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 w-full">
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 border-b border-border bg-[color-mix(in_srgb,var(--bg-base)_82%,transparent)] backdrop-blur-md transition-opacity duration-[120ms] ease-[var(--ease-out)]",
            docked ? "opacity-100" : "opacity-0",
          )}
        />
        <div className="relative mx-auto flex min-h-14 w-full max-w-[1280px] items-center gap-2 px-6">
          <Link
            href="/"
            className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <Image
              src="/logo.png"
              alt="Aiko"
              height={207}
              width={557}
              priority
              className="h-7 w-auto"
              style={{ width: "auto", height: "28px" }}
            />
          </Link>
          <div className="hidden min-w-0 flex-1 md:block">
            <NavLinks />
          </div>
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-auto md:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-60 bg-card">
              <SheetHeader>
                <SheetTitle className="font-display text-xl font-semibold">Aiko navigation</SheetTitle>
              </SheetHeader>
              <div className="px-2">
                <NavLinks onNavigate={() => setMenuOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main id="main-content" className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8">{children}</main>

      <footer className="mx-auto w-full max-w-[1280px] border-t border-border px-6 py-5">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
          <RadioTower className="size-3 text-primary" aria-hidden="true" />
          <span>2024 Aiko Telemetry Lab</span>
          <span>IPL 2022 archive</span>
          <Link href="/stats" className="hover:text-primary transition-colors">Stats</Link>
          <Link href="/players" className="hover:text-primary transition-colors">Players</Link>
          <Link href="/standings" className="hover:text-primary transition-colors">Standings</Link>
        </p>
      </footer>

      {docked ? (
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="fixed right-6 bottom-6 z-50 shadow-[var(--shadow-modal)]"
          aria-label="Scroll to top"
          onClick={() => {
            if (lenis) lenis.scrollTo(0, { immediate: false });
            else window.scrollTo(0, 0);
          }}
        >
          <ChevronUp />
        </Button>
      ) : null}
    </div>
  );
}

"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronUp, Menu } from "lucide-react";
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
      <header className="sticky top-0 z-40 w-full">
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 border-b border-border bg-card transition-opacity duration-[120ms] ease-[var(--ease-out)]",
            docked ? "opacity-100" : "opacity-0",
          )}
        />
        <div className="relative mx-auto flex min-h-14 w-full max-w-[1280px] items-center gap-2 px-6">
          <Link
            href="/"
            className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <Image src="/logo.png" alt="Aiko" height={28} width={112} priority />
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
                <SheetTitle className="font-heading text-xl font-normal">Menu</SheetTitle>
              </SheetHeader>
              <div className="px-2">
                <NavLinks onNavigate={() => setMenuOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1280px] px-6 py-8">{children}</main>
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

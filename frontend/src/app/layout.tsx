import type { Metadata } from "next";
import {
  Big_Shoulders,
  JetBrains_Mono,
  Manrope,
  Space_Grotesk,
} from "next/font/google";
import { ReactLenis } from "lenis/react";

import { AppShell } from "@/components/app-shell";
import { Providers } from "@/components/providers";

import "./globals.css";
import "lenis/dist/lenis.css";

const manrope = Manrope({
  variable: "--font-aiko-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-aiko-display",
  subsets: ["latin"],
});

const bigShoulders = Big_Shoulders({
  variable: "--font-aiko-hero",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-aiko-mono",
  subsets: ["latin"],
});

const fontVariables = [
  manrope.variable,
  spaceGrotesk.variable,
  bigShoulders.variable,
  jetBrainsMono.variable,
].join(" ");

export const metadata: Metadata = {
  title: {
    default: "Aiko | IPL 2022 Analytics",
    template: "%s | Aiko",
  },
  description:
    "Production IPL 2022 analytics for matches, standings, teams, players, venues, scorecards, and archived ball-by-ball telemetry.",
  applicationName: "Aiko",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Aiko | IPL 2022 Analytics",
    description:
      "Explore IPL 2022 match results, scorecards, standings, player stats, venues, and wagon-wheel telemetry.",
    siteName: "Aiko",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fontVariables} dark h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <Providers>
          <ReactLenis
            root
            options={{ lerp: 0.08, duration: 1.1, smoothWheel: true, respectReducedMotion: true }}
          >
            <AppShell>{children}</AppShell>
          </ReactLenis>
        </Providers>
      </body>
    </html>
  );
}

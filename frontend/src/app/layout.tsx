import type { Metadata } from "next";
import { IBM_Plex_Mono, Newsreader, Source_Sans_3 } from "next/font/google";
import { ReactLenis } from "lenis/react";

import { AppShell } from "@/components/app-shell";

import "./globals.css";
import "lenis/dist/lenis.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Aiko",
  description: "Independent IPL 2022 analytics",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sourceSans.variable} ${newsreader.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <ReactLenis
          root
          options={{ lerp: 0.08, duration: 1.1, smoothWheel: true, respectReducedMotion: true }}
        >
          <AppShell>{children}</AppShell>
        </ReactLenis>
      </body>
    </html>
  );
}

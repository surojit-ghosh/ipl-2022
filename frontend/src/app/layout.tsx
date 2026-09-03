import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ReactLenis } from "lenis/react";

import { AppShell } from "@/components/app-shell";
import { Providers } from "@/components/providers";

import "./globals.css";
import "lenis/dist/lenis.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aiko",
  description: "Independent IPL 2022 analytics",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
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

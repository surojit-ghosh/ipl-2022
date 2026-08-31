import type { MatchListResponse } from "@/features/home/types";

export type TeamSummary = {
  id: number;
  name: string;
  abbreviation: string | null;
  alternateName: string | null;
  type: string | null;
  country: string | null;
  logoUrl: string | null;
  thumbnailUrl: string | null;
};

export type TeamProfile = {
  id: number;
  name: string;
  abbreviation: string | null;
  alternateName: string | null;
  type: string | null;
  country: string | null;
  logoUrl: string | null;
  thumbnailUrl: string | null;
  seasonSquadMembers: SquadMember[];
  standings: TeamStanding[];
};

export type SquadMember = {
  role: string | null;
  player: {
    id: number;
    name: string;
    shortName: string | null;
    playingRole: string | null;
    logoUrl: string | null;
    thumbnailUrl: string | null;
  };
  season: {
    year: number;
  };
};

export type TeamStanding = {
  id: number;
  position: number;
  played: number | null;
  wins: number | null;
  losses: number | null;
  points: number | null;
  netRunRate: number | null;
  season: {
    year: number;
    slug: string;
  };
};

export type TeamStats = {
  teamId: number;
  scope: string;
  matches: number;
  wins: number;
  losses: number;
  snapshots: TeamStatSnapshot[];
};

export type TeamStatSnapshot = {
  id: string;
  metric: string;
  values: Record<string, unknown>;
  season: {
    year: number;
    slug: string;
  };
};

export type TeamMatches = MatchListResponse;

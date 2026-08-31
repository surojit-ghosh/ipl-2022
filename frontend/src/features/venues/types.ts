import type { MatchCard } from "@/features/home/types";

export type VenueSummary = {
  id: number;
  name: string;
  location: string | null;
  country: string | null;
  timezone: string | null;
  _count: {
    matches: number;
  };
};

export type VenueDetail = {
  id: number;
  name: string;
  location: string | null;
  country: string | null;
  timezone: string | null;
  matches: MatchCard[];
};

export type VenueStats = {
  venueId: number;
  matches: number;
  averageFirstInningsScore: number | null;
  highestFirstInningsScore: number | null;
  lowestFirstInningsScore: number | null;
};

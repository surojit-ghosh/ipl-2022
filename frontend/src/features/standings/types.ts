export type StandingTeam = {
  id: number;
  name: string;
  abbreviation: string | null;
  logoUrl: string | null;
  thumbnailUrl: string | null;
};

export type Standing = {
  id: number;
  position: number;
  played: number | null;
  wins: number | null;
  losses: number | null;
  draws: number | null;
  noResults: number | null;
  oversFor: string | null;
  runsFor: number | null;
  oversAgainst: string | null;
  runsAgainst: number | null;
  netRunRate: number | null;
  points: number | null;
  lastFiveMatches: string | null;
  lastFiveResults: string | null;
  team: StandingTeam;
  season: {
    year: number;
    slug: string;
  };
};

export type StandingsResponse = {
  data: Standing[];
};

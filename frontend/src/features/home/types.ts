export type TeamCard = {
  id: number;
  name: string;
  abbreviation: string | null;
  logoUrl: string | null;
  thumbnailUrl: string | null;
};

export type MatchCard = {
  id: number;
  title: string;
  shortTitle: string | null;
  subtitle: string | null;
  matchNumber: string | null;
  statusText: string | null;
  statusNote: string | null;
  winMargin: string | null;
  startAt: string | null;
  teamA: TeamCard;
  teamB: TeamCard;
  venue: { id: number; name: string; location: string | null } | null;
  winningTeam: { id: number; name: string; abbreviation: string | null } | null;
  innings: {
    number: number;
    scores: string | null;
    overs: string | null;
    battingTeamId: number;
    battingTeam: TeamCard;
  }[];
};

export type MatchListResponse = {
  data: MatchCard[];
  meta: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
};

export const HOME_PAGE_SIZE = 10;

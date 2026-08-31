export type Player = {
  id: number;
  name: string;
  shortName: string | null;
  playingRole: string | null;
  country: string | null;
  nationality: string | null;
  logoUrl: string | null;
  thumbnailUrl: string | null;
};

export type PlayerDetail = Player & {
  firstName: string | null;
  lastName: string | null;
  birthDate: string | null;
  birthPlace: string | null;
  battingStyle: string | null;
  bowlingStyle: string | null;
  fieldingPosition: string | null;
  seasonSquadMembers: {
    role: string | null;
    team: {
      id: number;
      name: string;
      abbreviation: string | null;
    };
    season: {
      year: number;
    };
  }[];
  careerBatting: CareerBatting[];
  careerBowling: CareerBowling[];
};

export type CareerBatting = {
  id: number;
  format: string;
  matches: number | null;
  innings: number | null;
  notOuts: number | null;
  runs: number | null;
  balls: number | null;
  highest: number | null;
  hundreds: number | null;
  fifties: number | null;
  fours: number | null;
  sixes: number | null;
  catches: number | null;
  stumpings: number | null;
  sourceAverage: number | null;
  sourceStrike: number | null;
};

export type CareerBowling = {
  id: number;
  format: string;
  matches: number | null;
  innings: number | null;
  balls: number | null;
  overs: number | null;
  runs: number | null;
  wickets: number | null;
  bestInning: string | null;
  bestMatch: string | null;
  fours: number | null;
  fives: number | null;
  tens: number | null;
  hatTricks: number | null;
  maidens: number | null;
  sourceEconomy: number | null;
  sourceAverage: number | null;
  sourceStrike: number | null;
};

export type PlayerSeasonStats = {
  playerId: number;
  scope: string;
  batting: {
    innings: number;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    average: number | null;
    strikeRate: number | null;
  };
  bowling: {
    innings: number;
    wickets: number;
    runsConceded: number;
    maidens: number;
    economy: number | null;
  };
};

export type PlayersResponse = {
  data: Player[];
  meta: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
};

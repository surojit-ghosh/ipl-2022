export type Team = {
  id: number;
  name: string;
  abbreviation: string | null;
  logoUrl: string | null;
  thumbnailUrl: string | null;
  location?: string | null;
  country?: string | null;
};

export type Player = {
  id: number;
  name: string;
  shortName: string | null;
  playingRole: string | null;
  battingStyle: string | null;
  bowlingStyle: string | null;
  logoUrl: string | null;
  thumbnailUrl: string | null;
};

export type Venue = {
  id: number;
  name: string;
  location: string | null;
  country: string | null;
  timezone: string | null;
};

export type BattingScore = {
  id: number;
  playerId: number;
  isBatting: boolean | null;
  position: string | null;
  role: string | null;
  runs: number | null;
  ballsFaced: number | null;
  fours: number | null;
  sixes: number | null;
  strikeRate: number | null;
  dismissal: string | null;
  howOut: string | null;
  bowlerId: number | null;
  firstFielderId: number | null;
  secondFielderId: number | null;
  thirdFielderId: number | null;
  bowler: Player | null;
  firstFielder: Player | null;
  secondFielder: Player | null;
  thirdFielder: Player | null;
  player: Player;
};

export type BowlingFigure = {
  id: number;
  playerId: number;
  overs: string | null;
  maidens: number | null;
  runsConceded: number | null;
  wickets: number | null;
  noBalls: number | null;
  wides: number | null;
  economy: number | null;
  position: string | null;
  isBowling: boolean | null;
  player: Player;
};

export type FieldingFigure = {
  id: number;
  catches: number | null;
  runOutThrower: number | null;
  runOutCatcher: number | null;
  directHits: number | null;
  stumpings: number | null;
  substitute: boolean | null;
  player: Player;
};

export type FallOfWicket = {
  id: number;
  wicketNumber: number;
  playerId: number | null;
  runs: number | null;
  balls: number | null;
  dismissal: string | null;
  howOut: string | null;
  scoreAtDismissal: number | null;
  oversAtDismissal: string | null;
  bowlerId: number | null;
  bowler: Player | null;
  player: Player | null;
};

export type InningExtra = {
  byes: number | null;
  legByes: number | null;
  wides: number | null;
  noBalls: number | null;
  penalty: number | null;
  total: number | null;
};

export type Inning = {
  id: number;
  number: number;
  name: string | null;
  status: number | null;
  isSuperOver: boolean;
  result: number | null;
  scores: string | null;
  overs: string | null;
  target: number | null;
  battingTeamId: number;
  battingTeam: Team;
  fieldingTeam: Team;
  battingScores: BattingScore[];
  bowlingFigures: BowlingFigure[];
  fieldingFigures: FieldingFigure[];
  fallOfWickets: FallOfWicket[];
  extras: InningExtra | null;
};

export type MatchOfficial = {
  id: number;
  role: string;
  name: string;
  country: string | null;
  isTvUmpire: boolean;
  position: number;
};

export type MatchAward = {
  id: number;
  awardType: string;
  sourceName: string | null;
  player: Player | null;
};

export type MatchPlayingXi = {
  id: number;
  battingOrder: number | null;
  isDidNotBat: boolean;
  team: Team;
  player: Player;
};

export type MatchDetail = {
  id: number;
  title: string;
  shortTitle: string | null;
  subtitle: string | null;
  matchNumber: string | null;
  format: string | null;
  statusText: string | null;
  statusNote: string | null;
  winMargin: string | null;
  tossDecision: number | null;
  startAt: string | null;
  endAt: string | null;
  teamA: Team;
  teamB: Team;
  venue: Venue | null;
  winningTeam: Team | null;
  tossWinner: Team | null;
  playerOfMatch: Player | null;
  officials: MatchOfficial[];
  awards: MatchAward[];
  playingXi: MatchPlayingXi[];
  innings: Inning[];
};

export type ScorecardResponse = {
  matchId: number;
  innings: Inning[];
};

export type CommentaryEvent = {
  id: number;
  inningId: number;
  eventType: string;
  sourceOver: number | null;
  sourceBall: number | null;
  sequenceNo: number;
  batterId: number | null;
  bowlerId: number | null;
  totalRuns: number | null;
  batRuns: number | null;
  isFour: boolean | null;
  isSix: boolean | null;
  isWicket: boolean | null;
  noBallRuns: number | null;
  wideRuns: number | null;
  byeRuns: number | null;
  legByeRuns: number | null;
  isNoBall: boolean | null;
  isWide: boolean | null;
  commentary: string | null;
  detailText: string | null;
  batter: Player | null;
  bowler: Player | null;
  inning: {
    number: number;
    name: string | null;
    battingTeam: Team;
  };
};

export type CommentaryResponse = {
  matchId: number;
  data: CommentaryEvent[];
};

export type WagonShot = {
  id: number;
  inningId: number;
  sequenceNo: number;
  sourceOver: number | null;
  batRuns: number | null;
  teamRuns: number | null;
  x: number | null;
  y: number | null;
  zoneId: number | null;
  zoneName: string | null;
  eventName: string | null;
  batter: Player | null;
  bowler: Player | null;
  inning: {
    number: number;
    name: string | null;
    battingTeam: Team;
  };
};

export type WagonWheelResponse = {
  matchId: number;
  historical: true;
  data: WagonShot[];
};

export type SnapshotPlayer = {
  name?: string;
  batsman_id?: number | string;
  bowler_id?: number | string;
  runs?: number;
  balls?: number;
  balls_faced?: number;
  fours?: number;
  sixes?: number;
  strike_rate?: string;
  overs?: number;
  runs_conceded?: number;
  wickets?: number;
  maidens?: number;
  econ?: string;
};

export type HistoricalSnapshotData = {
  status_note?: string;
  team_batting?: string;
  team_bowling?: string;
  live_inning_number?: number;
  live_score?: {
    runs?: number;
    overs?: number;
    wickets?: number;
    target?: number;
    runrate?: number;
    required_runrate?: number;
  };
  batsmen?: SnapshotPlayer[];
  bowlers?: SnapshotPlayer[];
  current_partnership?: { runs?: number; balls?: number; overs?: number; batsmen?: SnapshotPlayer[] };
  recent_scores?: string;
  last_five_overs?: string;
  last_ten_overs?: string;
  last_wicket?: SnapshotPlayer & {
    how_out?: string;
    score_at_dismissal?: number;
    overs_at_dismissal?: string;
    dismissal?: string;
    number?: number;
  };
  review?: {
    batting?: Record<string, string | number>;
    bowling?: Record<string, string | number>;
  };
  powerplay?: unknown[];
  live_inning?: {
    name?: string;
    status?: number;
    result?: number;
    issuperover?: string;
    scores?: string;
    scores_full?: string;
    extra_runs?: Record<string, string | number>;
  };
};

export type HistoricalSnapshotResponse = {
  matchId: number;
  historical: true;
  snapshotType: string;
  sourceFile: { relativePath: string; sha256: string; byteSize: number };
  payload: HistoricalSnapshotData;
};

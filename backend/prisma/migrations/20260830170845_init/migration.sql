-- CreateTable
CREATE TABLE "Competition" (
    "id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "abbreviation" TEXT,
    "type" TEXT,
    "category" TEXT,
    "matchFormat" TEXT,

    CONSTRAINT "Competition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Season" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "competitionId" INTEGER NOT NULL,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT,
    "alternateName" TEXT,
    "type" TEXT,
    "country" TEXT,
    "logoUrl" TEXT,
    "thumbnailUrl" TEXT,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeasonTeam" (
    "seasonId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,

    CONSTRAINT "SeasonTeam_pkey" PRIMARY KEY ("seasonId","teamId")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "birthDate" TIMESTAMP(3),
    "birthPlace" TEXT,
    "country" TEXT,
    "nationality" TEXT,
    "playingRole" TEXT,
    "battingStyle" TEXT,
    "bowlingStyle" TEXT,
    "fieldingPosition" TEXT,
    "logoUrl" TEXT,
    "thumbnailUrl" TEXT,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeasonSquadMember" (
    "seasonId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "role" TEXT,

    CONSTRAINT "SeasonSquadMember_pkey" PRIMARY KEY ("seasonId","teamId","playerId")
);

-- CreateTable
CREATE TABLE "Venue" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "country" TEXT,
    "timezone" TEXT,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" INTEGER NOT NULL,
    "competitionId" INTEGER NOT NULL,
    "seasonId" INTEGER NOT NULL,
    "teamAId" INTEGER NOT NULL,
    "teamBId" INTEGER NOT NULL,
    "venueId" INTEGER,
    "winningTeamId" INTEGER,
    "tossWinnerId" INTEGER,
    "playerOfMatchId" INTEGER,
    "title" TEXT NOT NULL,
    "shortTitle" TEXT,
    "subtitle" TEXT,
    "matchNumber" TEXT,
    "format" TEXT,
    "status" INTEGER,
    "statusText" TEXT,
    "statusNote" TEXT,
    "resultType" INTEGER,
    "winMargin" TEXT,
    "tossDecision" INTEGER,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "raw" JSONB,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inning" (
    "id" INTEGER NOT NULL,
    "matchId" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "name" TEXT,
    "status" INTEGER,
    "isSuperOver" BOOLEAN NOT NULL DEFAULT false,
    "result" INTEGER,
    "battingTeamId" INTEGER NOT NULL,
    "fieldingTeamId" INTEGER NOT NULL,
    "scores" TEXT,
    "overs" TEXT,
    "target" INTEGER,

    CONSTRAINT "Inning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BattingScore" (
    "id" SERIAL NOT NULL,
    "inningId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "isBatting" BOOLEAN,
    "position" TEXT,
    "role" TEXT,
    "runs" INTEGER,
    "ballsFaced" INTEGER,
    "fours" INTEGER,
    "sixes" INTEGER,
    "strikeRate" DOUBLE PRECISION,
    "dismissal" TEXT,
    "howOut" TEXT,
    "bowlerId" INTEGER,
    "firstFielderId" INTEGER,
    "secondFielderId" INTEGER,
    "thirdFielderId" INTEGER,

    CONSTRAINT "BattingScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BowlingFigure" (
    "id" SERIAL NOT NULL,
    "inningId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "isBowling" BOOLEAN,
    "position" TEXT,
    "overs" TEXT,
    "maidens" INTEGER,
    "runsConceded" INTEGER,
    "wickets" INTEGER,
    "noBalls" INTEGER,
    "wides" INTEGER,
    "economy" DOUBLE PRECISION,

    CONSTRAINT "BowlingFigure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FieldingFigure" (
    "id" SERIAL NOT NULL,
    "inningId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "catches" INTEGER,
    "runOutThrower" INTEGER,
    "runOutCatcher" INTEGER,
    "directHits" INTEGER,
    "stumpings" INTEGER,
    "substitute" BOOLEAN,

    CONSTRAINT "FieldingFigure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FallOfWicket" (
    "id" SERIAL NOT NULL,
    "inningId" INTEGER NOT NULL,
    "wicketNumber" INTEGER NOT NULL,
    "playerId" INTEGER,
    "runs" INTEGER,
    "balls" INTEGER,
    "dismissal" TEXT,
    "howOut" TEXT,
    "scoreAtDismissal" INTEGER,
    "oversAtDismissal" TEXT,
    "bowlerId" INTEGER,

    CONSTRAINT "FallOfWicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InningExtra" (
    "id" SERIAL NOT NULL,
    "inningId" INTEGER NOT NULL,
    "byes" INTEGER,
    "legByes" INTEGER,
    "wides" INTEGER,
    "noBalls" INTEGER,
    "penalty" INTEGER,
    "total" INTEGER,

    CONSTRAINT "InningExtra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Standing" (
    "id" SERIAL NOT NULL,
    "seasonId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "played" INTEGER,
    "wins" INTEGER,
    "losses" INTEGER,
    "draws" INTEGER,
    "noResults" INTEGER,
    "oversFor" TEXT,
    "runsFor" INTEGER,
    "oversAgainst" TEXT,
    "runsAgainst" INTEGER,
    "netRunRate" DOUBLE PRECISION,
    "points" INTEGER,
    "lastFiveMatches" TEXT,
    "lastFiveResults" TEXT,

    CONSTRAINT "Standing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamStatSnapshot" (
    "id" TEXT NOT NULL,
    "seasonId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "metric" TEXT NOT NULL,
    "values" JSONB NOT NULL,

    CONSTRAINT "TeamStatSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Season_year_key" ON "Season"("year");

-- CreateIndex
CREATE UNIQUE INDEX "Season_slug_key" ON "Season"("slug");

-- CreateIndex
CREATE INDEX "SeasonTeam_teamId_idx" ON "SeasonTeam"("teamId");

-- CreateIndex
CREATE INDEX "SeasonSquadMember_playerId_idx" ON "SeasonSquadMember"("playerId");

-- CreateIndex
CREATE INDEX "Match_seasonId_startAt_idx" ON "Match"("seasonId", "startAt");

-- CreateIndex
CREATE INDEX "Match_teamAId_idx" ON "Match"("teamAId");

-- CreateIndex
CREATE INDEX "Match_teamBId_idx" ON "Match"("teamBId");

-- CreateIndex
CREATE INDEX "Match_winningTeamId_idx" ON "Match"("winningTeamId");

-- CreateIndex
CREATE INDEX "Inning_matchId_number_idx" ON "Inning"("matchId", "number");

-- CreateIndex
CREATE INDEX "BattingScore_playerId_idx" ON "BattingScore"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "BattingScore_inningId_playerId_key" ON "BattingScore"("inningId", "playerId");

-- CreateIndex
CREATE INDEX "BowlingFigure_playerId_idx" ON "BowlingFigure"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "BowlingFigure_inningId_playerId_key" ON "BowlingFigure"("inningId", "playerId");

-- CreateIndex
CREATE INDEX "FieldingFigure_playerId_idx" ON "FieldingFigure"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "FieldingFigure_inningId_playerId_key" ON "FieldingFigure"("inningId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "FallOfWicket_inningId_wicketNumber_key" ON "FallOfWicket"("inningId", "wicketNumber");

-- CreateIndex
CREATE UNIQUE INDEX "InningExtra_inningId_key" ON "InningExtra"("inningId");

-- CreateIndex
CREATE INDEX "Standing_seasonId_position_idx" ON "Standing"("seasonId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Standing_seasonId_teamId_key" ON "Standing"("seasonId", "teamId");

-- CreateIndex
CREATE INDEX "TeamStatSnapshot_metric_idx" ON "TeamStatSnapshot"("metric");

-- CreateIndex
CREATE UNIQUE INDEX "TeamStatSnapshot_seasonId_teamId_metric_key" ON "TeamStatSnapshot"("seasonId", "teamId", "metric");

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonTeam" ADD CONSTRAINT "SeasonTeam_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonTeam" ADD CONSTRAINT "SeasonTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonSquadMember" ADD CONSTRAINT "SeasonSquadMember_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonSquadMember" ADD CONSTRAINT "SeasonSquadMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonSquadMember" ADD CONSTRAINT "SeasonSquadMember_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_teamAId_fkey" FOREIGN KEY ("teamAId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_teamBId_fkey" FOREIGN KEY ("teamBId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_winningTeamId_fkey" FOREIGN KEY ("winningTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_tossWinnerId_fkey" FOREIGN KEY ("tossWinnerId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_playerOfMatchId_fkey" FOREIGN KEY ("playerOfMatchId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inning" ADD CONSTRAINT "Inning_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inning" ADD CONSTRAINT "Inning_battingTeamId_fkey" FOREIGN KEY ("battingTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inning" ADD CONSTRAINT "Inning_fieldingTeamId_fkey" FOREIGN KEY ("fieldingTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattingScore" ADD CONSTRAINT "BattingScore_inningId_fkey" FOREIGN KEY ("inningId") REFERENCES "Inning"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattingScore" ADD CONSTRAINT "BattingScore_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BowlingFigure" ADD CONSTRAINT "BowlingFigure_inningId_fkey" FOREIGN KEY ("inningId") REFERENCES "Inning"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BowlingFigure" ADD CONSTRAINT "BowlingFigure_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldingFigure" ADD CONSTRAINT "FieldingFigure_inningId_fkey" FOREIGN KEY ("inningId") REFERENCES "Inning"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldingFigure" ADD CONSTRAINT "FieldingFigure_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FallOfWicket" ADD CONSTRAINT "FallOfWicket_inningId_fkey" FOREIGN KEY ("inningId") REFERENCES "Inning"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FallOfWicket" ADD CONSTRAINT "FallOfWicket_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InningExtra" ADD CONSTRAINT "InningExtra_inningId_fkey" FOREIGN KEY ("inningId") REFERENCES "Inning"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Standing" ADD CONSTRAINT "Standing_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Standing" ADD CONSTRAINT "Standing_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamStatSnapshot" ADD CONSTRAINT "TeamStatSnapshot_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamStatSnapshot" ADD CONSTRAINT "TeamStatSnapshot_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

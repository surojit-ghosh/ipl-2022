CREATE TABLE "MatchOfficial" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    CONSTRAINT "MatchOfficial_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MatchAward" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "awardType" TEXT NOT NULL,
    "playerId" INTEGER,
    "sourceName" TEXT,
    CONSTRAINT "MatchAward_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MatchPlayingXi" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "battingOrder" INTEGER,
    "isDidNotBat" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "MatchPlayingXi_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CommentaryEvent" (
    "id" SERIAL NOT NULL,
    "sourceEventId" INTEGER,
    "matchId" INTEGER NOT NULL,
    "inningId" INTEGER NOT NULL,
    "eventType" TEXT NOT NULL,
    "sourceOver" INTEGER,
    "sourceBall" INTEGER,
    "sequenceNo" INTEGER NOT NULL,
    "occurredAt" TIMESTAMP(3),
    "batterId" INTEGER,
    "bowlerId" INTEGER,
    "totalRuns" INTEGER,
    "batRuns" INTEGER,
    "noBallRuns" INTEGER,
    "wideRuns" INTEGER,
    "byeRuns" INTEGER,
    "legByeRuns" INTEGER,
    "isNoBall" BOOLEAN,
    "isWide" BOOLEAN,
    "isFour" BOOLEAN,
    "isSix" BOOLEAN,
    "isWicket" BOOLEAN,
    "commentary" TEXT,
    "detailText" TEXT,
    CONSTRAINT "CommentaryEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WagonShot" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "inningId" INTEGER NOT NULL,
    "sequenceNo" INTEGER NOT NULL,
    "batterId" INTEGER,
    "bowlerId" INTEGER,
    "sourceOver" DOUBLE PRECISION,
    "batRuns" INTEGER,
    "teamRuns" INTEGER,
    "x" DOUBLE PRECISION,
    "y" DOUBLE PRECISION,
    "zoneId" INTEGER,
    "zoneName" TEXT,
    "eventName" TEXT,
    "uniqueOver" DOUBLE PRECISION,
    CONSTRAINT "WagonShot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PlayerCareerBatting" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "format" TEXT NOT NULL,
    "matches" INTEGER,
    "innings" INTEGER,
    "notOuts" INTEGER,
    "runs" INTEGER,
    "balls" INTEGER,
    "highest" INTEGER,
    "hundreds" INTEGER,
    "fifties" INTEGER,
    "fours" INTEGER,
    "sixes" INTEGER,
    "catches" INTEGER,
    "stumpings" INTEGER,
    "sourceAverage" DOUBLE PRECISION,
    "sourceStrike" DOUBLE PRECISION,
    CONSTRAINT "PlayerCareerBatting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PlayerCareerBowling" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "format" TEXT NOT NULL,
    "matches" INTEGER,
    "innings" INTEGER,
    "balls" INTEGER,
    "overs" DOUBLE PRECISION,
    "runs" INTEGER,
    "wickets" INTEGER,
    "bestInning" TEXT,
    "bestMatch" TEXT,
    "fours" INTEGER,
    "fives" INTEGER,
    "tens" INTEGER,
    "hatTricks" INTEGER,
    "maidens" INTEGER,
    "sourceEconomy" DOUBLE PRECISION,
    "sourceAverage" DOUBLE PRECISION,
    "sourceStrike" DOUBLE PRECISION,
    CONSTRAINT "PlayerCareerBowling_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SourceFile" (
    "id" SERIAL NOT NULL,
    "relativePath" TEXT NOT NULL,
    "sourceFamily" TEXT NOT NULL,
    "sha256" TEXT NOT NULL,
    "byteSize" INTEGER NOT NULL,
    "recordCount" INTEGER,
    "status" TEXT NOT NULL,
    CONSTRAINT "SourceFile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SourceSnapshot" (
    "id" SERIAL NOT NULL,
    "sourceFileId" INTEGER NOT NULL,
    "snapshotType" TEXT NOT NULL,
    "matchId" INTEGER,
    "payload" JSONB NOT NULL,
    CONSTRAINT "SourceSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MatchOfficial_matchId_role_position_key" ON "MatchOfficial"("matchId", "role", "position");
CREATE INDEX "MatchOfficial_matchId_idx" ON "MatchOfficial"("matchId");
CREATE UNIQUE INDEX "MatchAward_matchId_awardType_key" ON "MatchAward"("matchId", "awardType");
CREATE INDEX "MatchAward_playerId_idx" ON "MatchAward"("playerId");
CREATE UNIQUE INDEX "MatchPlayingXi_matchId_teamId_playerId_key" ON "MatchPlayingXi"("matchId", "teamId", "playerId");
CREATE INDEX "MatchPlayingXi_playerId_matchId_idx" ON "MatchPlayingXi"("playerId", "matchId");
CREATE UNIQUE INDEX "CommentaryEvent_inningId_sequenceNo_key" ON "CommentaryEvent"("inningId", "sequenceNo");
CREATE INDEX "CommentaryEvent_matchId_inningId_sequenceNo_idx" ON "CommentaryEvent"("matchId", "inningId", "sequenceNo");
CREATE INDEX "CommentaryEvent_sourceEventId_idx" ON "CommentaryEvent"("sourceEventId");
CREATE UNIQUE INDEX "WagonShot_inningId_sequenceNo_key" ON "WagonShot"("inningId", "sequenceNo");
CREATE INDEX "WagonShot_matchId_inningId_batterId_idx" ON "WagonShot"("matchId", "inningId", "batterId");
CREATE UNIQUE INDEX "PlayerCareerBatting_playerId_format_key" ON "PlayerCareerBatting"("playerId", "format");
CREATE INDEX "PlayerCareerBatting_format_idx" ON "PlayerCareerBatting"("format");
CREATE UNIQUE INDEX "PlayerCareerBowling_playerId_format_key" ON "PlayerCareerBowling"("playerId", "format");
CREATE INDEX "PlayerCareerBowling_format_idx" ON "PlayerCareerBowling"("format");
CREATE UNIQUE INDEX "SourceFile_relativePath_key" ON "SourceFile"("relativePath");
CREATE UNIQUE INDEX "SourceSnapshot_sourceFileId_key" ON "SourceSnapshot"("sourceFileId");
CREATE INDEX "SourceSnapshot_snapshotType_idx" ON "SourceSnapshot"("snapshotType");
CREATE INDEX "SourceSnapshot_matchId_idx" ON "SourceSnapshot"("matchId");

ALTER TABLE "MatchOfficial" ADD CONSTRAINT "MatchOfficial_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MatchAward" ADD CONSTRAINT "MatchAward_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MatchAward" ADD CONSTRAINT "MatchAward_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MatchPlayingXi" ADD CONSTRAINT "MatchPlayingXi_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MatchPlayingXi" ADD CONSTRAINT "MatchPlayingXi_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MatchPlayingXi" ADD CONSTRAINT "MatchPlayingXi_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CommentaryEvent" ADD CONSTRAINT "CommentaryEvent_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommentaryEvent" ADD CONSTRAINT "CommentaryEvent_inningId_fkey" FOREIGN KEY ("inningId") REFERENCES "Inning"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommentaryEvent" ADD CONSTRAINT "CommentaryEvent_batterId_fkey" FOREIGN KEY ("batterId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CommentaryEvent" ADD CONSTRAINT "CommentaryEvent_bowlerId_fkey" FOREIGN KEY ("bowlerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WagonShot" ADD CONSTRAINT "WagonShot_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WagonShot" ADD CONSTRAINT "WagonShot_inningId_fkey" FOREIGN KEY ("inningId") REFERENCES "Inning"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WagonShot" ADD CONSTRAINT "WagonShot_batterId_fkey" FOREIGN KEY ("batterId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WagonShot" ADD CONSTRAINT "WagonShot_bowlerId_fkey" FOREIGN KEY ("bowlerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PlayerCareerBatting" ADD CONSTRAINT "PlayerCareerBatting_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerCareerBowling" ADD CONSTRAINT "PlayerCareerBowling_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SourceSnapshot" ADD CONSTRAINT "SourceSnapshot_sourceFileId_fkey" FOREIGN KEY ("sourceFileId") REFERENCES "SourceFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

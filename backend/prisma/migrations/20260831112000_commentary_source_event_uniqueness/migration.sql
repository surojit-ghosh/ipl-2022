CREATE UNIQUE INDEX "CommentaryEvent_sourceEventId_unique"
ON "CommentaryEvent"("sourceEventId")
WHERE "sourceEventId" IS NOT NULL;

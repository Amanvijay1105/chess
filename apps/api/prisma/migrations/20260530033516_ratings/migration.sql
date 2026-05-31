-- CreateEnum
CREATE TYPE "RatingType" AS ENUM ('BULLET', 'BLITZ', 'RAPID', 'CLASSICAL', 'PUZZLE');

-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "type" "RatingType" NOT NULL,
    "currentRating" INTEGER NOT NULL DEFAULT 1200,
    "peakRating" INTEGER NOT NULL DEFAULT 1200,
    "gamesPlayed" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Rating_playerId_idx" ON "Rating"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_playerId_type_key" ON "Rating"("playerId", "type");

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

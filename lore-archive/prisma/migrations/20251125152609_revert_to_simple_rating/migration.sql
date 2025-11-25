/*
  Warnings:

  - You are about to drop the column `personalVote` on the `Rating` table. All the data in the column will be lost.
  - You are about to drop the column `technicalVote` on the `Rating` table. All the data in the column will be lost.
  - You are about to drop the column `totalValue` on the `Rating` table. All the data in the column will be lost.
  - Added the required column `value` to the `Rating` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "Rating_new" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "movieId" INTEGER NOT NULL,
    "value" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "Rating_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "Rating_new" ("id", "movieId", "value")
SELECT "id", "movieId", COALESCE("totalValue", 0)
FROM "Rating";
DROP TABLE "Rating";
ALTER TABLE "Rating_new" RENAME TO "Rating";
CREATE UNIQUE INDEX "Rating_movieId_key" ON "Rating"("movieId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

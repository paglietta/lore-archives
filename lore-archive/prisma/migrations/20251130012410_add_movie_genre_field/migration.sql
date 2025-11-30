/*
  Warnings:

  - Added the required column `genre` to the `MovieGenre` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MovieGenre" (
    "ownerId" TEXT NOT NULL,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "movieId" INTEGER NOT NULL,
    "genre" TEXT NOT NULL,
    CONSTRAINT "MovieGenre_ownerId_movieId_fkey" FOREIGN KEY ("ownerId", "movieId") REFERENCES "Movie" ("ownerId", "id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MovieGenre" ("id", "movieId", "ownerId") SELECT "id", "movieId", "ownerId" FROM "MovieGenre";
DROP TABLE "MovieGenre";
ALTER TABLE "new_MovieGenre" RENAME TO "MovieGenre";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

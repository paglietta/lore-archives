/*
  Warnings:

  - The primary key for the `Movie` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `genre` on the `MovieGenre` table. All the data in the column will be lost.
  - Added the required column `ownerId` to the `Movie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `MovieGenre` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `Rating` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `Watchlist` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Movie" (
    "ownerId" TEXT NOT NULL,
    "id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "poster" TEXT,
    "releaseDate" TEXT,
    "category" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("ownerId", "id")
);
INSERT INTO "new_Movie" ("category", "createdAt", "id", "poster", "releaseDate", "title") SELECT "category", "createdAt", "id", "poster", "releaseDate", "title" FROM "Movie";
DROP TABLE "Movie";
ALTER TABLE "new_Movie" RENAME TO "Movie";
CREATE TABLE "new_MovieGenre" (
    "ownerId" TEXT NOT NULL,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "movieId" INTEGER NOT NULL,
    CONSTRAINT "MovieGenre_ownerId_movieId_fkey" FOREIGN KEY ("ownerId", "movieId") REFERENCES "Movie" ("ownerId", "id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MovieGenre" ("id", "movieId") SELECT "id", "movieId" FROM "MovieGenre";
DROP TABLE "MovieGenre";
ALTER TABLE "new_MovieGenre" RENAME TO "MovieGenre";
CREATE TABLE "new_Rating" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ownerId" TEXT NOT NULL,
    "movieId" INTEGER NOT NULL,
    "value" REAL NOT NULL,
    CONSTRAINT "Rating_ownerId_movieId_fkey" FOREIGN KEY ("ownerId", "movieId") REFERENCES "Movie" ("ownerId", "id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Rating" ("id", "movieId", "value") SELECT "id", "movieId", "value" FROM "Rating";
DROP TABLE "Rating";
ALTER TABLE "new_Rating" RENAME TO "Rating";
CREATE UNIQUE INDEX "Rating_ownerId_movieId_key" ON "Rating"("ownerId", "movieId");
CREATE TABLE "new_Watchlist" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ownerId" TEXT NOT NULL,
    "movieId" INTEGER NOT NULL,
    CONSTRAINT "Watchlist_ownerId_movieId_fkey" FOREIGN KEY ("ownerId", "movieId") REFERENCES "Movie" ("ownerId", "id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Watchlist" ("id", "movieId") SELECT "id", "movieId" FROM "Watchlist";
DROP TABLE "Watchlist";
ALTER TABLE "new_Watchlist" RENAME TO "Watchlist";
CREATE UNIQUE INDEX "Watchlist_ownerId_movieId_key" ON "Watchlist"("ownerId", "movieId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

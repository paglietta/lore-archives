/*
  Warnings:

  - A unique constraint covering the columns `[movieId]` on the table `Rating` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Rating_movieId_key" ON "Rating"("movieId");

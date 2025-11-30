import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(request: Request) {
    const user = await requireAuth();
    const body = await request.json();
    const movieId = Number(body.movieId);
    const value = Number(body.value);

    if (!movieId || Number.isNaN(value)) {
        return NextResponse.json({ error: "movieId and value are required" }, { status: 400 });
    }

    const existingRating = await prisma.rating.findUnique({
        where: { ownerId_movieId: { ownerId: user.id, movieId } },
    });

    const rating = existingRating
        ? await prisma.rating.update({
              where: { ownerId_movieId: { ownerId: user.id, movieId } },
              data: { value },
          })
        : await prisma.rating.create({
              data: {
                  ownerId: user.id,
                  movieId,
                  value,
              },
          });

    return NextResponse.json({ rating });
}
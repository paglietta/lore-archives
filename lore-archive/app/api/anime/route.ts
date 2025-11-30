import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(request: Request) {
    const user = await requireAuth();
    const body = await request.json();
    const { id, title, poster, releaseDate, category, genres } = body;

    const existingAnime = await prisma.movie.findUnique({
        where: { ownerId_id: { ownerId: user.id, id } },
    });

    if (existingAnime) {
        return NextResponse.json({ anime: existingAnime, alreadyExists: true });
    }

    const anime = await prisma.movie.create({
        data: {
            ownerId: user.id,
            id,
            title,
            poster,
            releaseDate,
            category,
        },
    });

    if (Array.isArray(genres)) {
        await prisma.movieGenre.createMany({
            data: genres.map((genre: string) => ({
                ownerId: user.id,
                movieId: anime.id,
                genre,
            })),
        });
    }

    return NextResponse.json({ anime });
}

export async function GET() {
    const user = await requireAuth();
    const anime = await prisma.movie.findMany({
        where: { ownerId: user.id, category: "ANIME" },
        include: { genres: true, ratings: true },
        orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ anime });
}

export async function DELETE(request: Request) {
    const user = await requireAuth();
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await prisma.movieGenre.deleteMany({ where: { ownerId: user.id, movieId: id } });
    await prisma.rating.deleteMany({ where: { ownerId: user.id, movieId: id } });
    await prisma.watchlist.deleteMany({ where: { ownerId: user.id, movieId: id } });
    await prisma.movie.delete({ where: { ownerId_id: { ownerId: user.id, id } } });

    return NextResponse.json({ ok: true });
}
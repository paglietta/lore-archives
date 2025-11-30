import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

function hashStringToInt(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; //convert to 32 bit
    }
    return Math.abs(hash);
}

export async function POST(request: Request) {
    const user = await requireAuth();
    const body = await request.json();
    const { id: originalId, title, poster, releaseDate, category, genres } = body;
    
    //convert string id
    const id = typeof originalId === 'string' ? hashStringToInt(originalId) : Number(originalId);

    const existingBook = await prisma.movie.findUnique({
        where: { ownerId_id: { ownerId: user.id, id } },
    });

    if (existingBook) {
        return NextResponse.json({ book: existingBook, alreadyExists: true });
    }

    const book = await prisma.movie.create({
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
                movieId: book.id,
                genre,
            })),
        });
    }

    return NextResponse.json({ book });
}

export async function GET() {
    const user = await requireAuth();
    const books = await prisma.movie.findMany({
        where: { ownerId: user.id, category: "BOOK" },
        include: { genres: true, ratings: true },
        orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ books });
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
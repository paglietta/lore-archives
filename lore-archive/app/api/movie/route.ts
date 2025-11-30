import {prisma} from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function POST(request: Request){
    const user = await requireAuth();
    const body = await request.json();
    const {id, title, poster, releaseDate, category, genres} = body;

    const existingMovie = await prisma.movie.findUnique({
        where: { ownerId_id: { ownerId: user.id, id } },
    });

    if (existingMovie){
        return Response.json({ movie: existingMovie, alreadyExists: true });
    }

    const newMovie = await prisma.movie.create({
        data: {
            ownerId: user.id,
            id,
            title,
            poster,
            releaseDate,
            category,
        },
    });

    if (genres && genres.length > 0){
        for (const g of genres){
            await prisma.movieGenre.create({
                data: {
                    ownerId: user.id,
                    movieId: newMovie.id,
                    genre: g,
                },
            });
        }
    }

    return Response.json({ok:true, movie: newMovie})
}

export async function GET() {
    const user = await requireAuth();
    const movies = await prisma.movie.findMany({
        where: { ownerId: user.id, category: "MOVIE" },
        include: { ratings: true, genres: true },
        orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ movies });
}

export async function DELETE(request: Request){
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
        return Response.json({ error: "ID mancante" }, { status: 400 });
    }

    const movieId = parseInt(id);

    await prisma.movieGenre.deleteMany({
        where: { ownerId: user.id, movieId }
    });

    await prisma.rating.deleteMany({
        where: { ownerId: user.id, movieId }
    });

    await prisma.watchlist.deleteMany({
        where: { ownerId: user.id, movieId }
    });

    await prisma.movie.delete({
        where: { ownerId_id: { ownerId: user.id, id: movieId } }
    });

    return Response.json({ ok: true });
}
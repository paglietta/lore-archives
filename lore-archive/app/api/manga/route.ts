import {prisma} from "@/lib/prisma";

export async function POST(request: Request){
    const body = await request.json();
    const {id, title, poster, releaseDate, category, genres} = body;

    const existingManga = await prisma.movie.findUnique({
        where: { id: id},
    });

    if (existingManga){
        return Response.json({ manga: existingManga, alreadyExists: true });
    }

    const newManga = await prisma.movie.create({
        data: {
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
                    movieId: newManga.id,
                    genre: g,
                },
            });
        }
    }

    return Response.json({ok:true, manga: newManga})
}

export async function GET(){
    const manga = await prisma.movie.findMany({
        where: { category: "MANGA" },
        include: { genres: true, ratings: true },
        orderBy: { createdAt: 'desc' },
    });

    return Response.json({ manga })
}

export async function DELETE(request: Request){
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
        return Response.json({ error: "ID missing" }, { status: 400 });
    }

    const mangaId = parseInt(id);

    await prisma.movieGenre.deleteMany({
        where: { movieId: mangaId }
    });

    await prisma.rating.deleteMany({
        where: { movieId: mangaId }
    });

    await prisma.watchlist.deleteMany({
        where: { movieId: mangaId }
    });

    await prisma.movie.delete({
        where: { id: mangaId }
    });

    return Response.json({ ok: true });
}
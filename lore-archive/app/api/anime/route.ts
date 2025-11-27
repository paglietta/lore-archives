import {prisma} from "@/lib/prisma";

export async function POST(request: Request){
    const body = await request.json();
    const {id, title, poster, releaseDate, category, genres} = body;

    const existingAnime = await prisma.movie.findUnique({
        where: { id: id},
    });

    if (existingAnime){
        return Response.json({ anime: existingAnime, alreadyExists: true });
    }

    const newAnime = await prisma.movie.create({
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
                    movieId: newAnime.id,
                    genre: g,
                },
            });
        }
    }

    return Response.json({ok:true, anime: newAnime})
}

export async function GET(){
    const anime = await prisma.movie.findMany({
        where: { category: "ANIME" },
        include: { genres: true, ratings: true },
        orderBy: { createdAt: 'desc' },
    });

    return Response.json({ anime })
}

export async function DELETE(request: Request){
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
        return Response.json({ error: "ID missing" }, { status: 400 });
    }

    const animeId = parseInt(id);

    await prisma.movieGenre.deleteMany({
        where: { movieId: animeId }
    });

    await prisma.rating.deleteMany({
        where: { movieId: animeId }
    });

    await prisma.watchlist.deleteMany({
        where: { movieId: animeId }
    });

    await prisma.movie.delete({
        where: { id: animeId }
    });

    return Response.json({ ok: true });
}
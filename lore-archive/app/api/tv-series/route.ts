import {prisma} from "@/lib/prisma";

export async function POST(request: Request){
    const body = await request.json();
    const {id, title, poster, releaseDate, category, genres} = body;

    const existingSeries = await prisma.movie.findUnique({
        where: { id: id},
    });

    if (existingSeries){
        return Response.json({ tvSeries: existingSeries, alreadyExists: true });
    }

    const newSeries = await prisma.movie.create({
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
                    movieId: newSeries.id,
                    genre: g,
                },
            });
        }
    }

    return Response.json({ok:true, tvSeries: newSeries})
}

export async function GET(){
    const tvSeries = await prisma.movie.findMany({
        where: { category: "TV_SERIES" },
        include: { genres: true, ratings: true },
        orderBy: { createdAt: 'desc' },
    });

    return Response.json({ tvSeries })
}

export async function DELETE(request: Request){
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
        return Response.json({ error: "ID missing" }, { status: 400 });
    }

    const seriesId = parseInt(id);

    await prisma.movieGenre.deleteMany({
        where: { movieId: seriesId }
    });

    await prisma.rating.deleteMany({
        where: { movieId: seriesId }
    });

    await prisma.watchlist.deleteMany({
        where: { movieId: seriesId }
    });

    await prisma.movie.delete({
        where: { id: seriesId }
    });

    return Response.json({ ok: true });
}
import {prisma} from "@/lib/prisma";

export async function POST(request: Request){
    const body = await request.json();
    const {id, title, poster, releaseDate, category, genres} = body;

    const existingComic = await prisma.movie.findUnique({
        where: { id: id},
    });

    if (existingComic){
        return Response.json({ comic: existingComic, alreadyExists: true });
    }

    const newComic = await prisma.movie.create({
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
                    movieId: newComic.id,
                    genre: g,
                },
            });
        }
    }

    return Response.json({ok:true, comic: newComic})
}

export async function GET(){
    const comics = await prisma.movie.findMany({
        where: { category: "COMIC" },
        include: { genres: true, ratings: true },
        orderBy: { createdAt: 'desc' },
    });

    return Response.json({ comics })
}

export async function DELETE(request: Request){
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
        return Response.json({ error: "ID missing" }, { status: 400 });
    }

    const comicId = parseInt(id);

    await prisma.movieGenre.deleteMany({
        where: { movieId: comicId }
    });

    await prisma.rating.deleteMany({
        where: { movieId: comicId }
    });

    await prisma.watchlist.deleteMany({
        where: { movieId: comicId }
    });

    await prisma.movie.delete({
        where: { id: comicId }
    });

    return Response.json({ ok: true });
}
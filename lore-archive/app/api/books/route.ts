import {prisma} from "@/lib/prisma";

export async function POST(request: Request){
    const body = await request.json();
    const {id, title, poster, releaseDate, category, genres} = body;

    const existingBook = await prisma.movie.findUnique({
        where: { id: id},
    });

    if (existingBook){
        return Response.json({ book: existingBook, alreadyExists: true });
    }

    const newBook = await prisma.movie.create({
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
                    movieId: newBook.id,
                    genre: g,
                },
            });
        }
    }

    return Response.json({ok:true, book: newBook})
}

export async function GET(){
    const books = await prisma.movie.findMany({
        where: { category: "BOOK" },
        include: { genres: true, ratings: true },
        orderBy: { createdAt: 'desc' },
    });

    return Response.json({ books })
}

export async function DELETE(request: Request){
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
        return Response.json({ error: "ID missing" }, { status: 400 });
    }

    const bookId = parseInt(id);

    await prisma.movieGenre.deleteMany({
        where: { movieId: bookId }
    });

    await prisma.rating.deleteMany({
        where: { movieId: bookId }
    });

    await prisma.watchlist.deleteMany({
        where: { movieId: bookId }
    });

    await prisma.movie.delete({
        where: { id: bookId }
    });

    return Response.json({ ok: true });
}
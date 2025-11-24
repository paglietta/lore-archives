import {prisma} from "@/lib/prisma";

export async function POST(request: Request){
    const body = await request.json(); //body inviato
    const {id, title, poster, releaseDate, category, genres} = body; //estraiamo i campi che servono

    const existingMovie = await prisma.movie.findUnique({
        where: { id: id},
    });

    if (existingMovie){
        return Response.json({ movie: existingMovie });
    }

    const newMovie = await prisma.movie.create({ //crea un nuovo record con i campi che voglio salvare
        data: {
            id,
            title,
            poster,
            releaseDate,
            category,
        },
    });

    if (genres && genres.length > 0){
        for (const g of genres){ //ciclo su ogni genere passato dal frontend
            await prisma.movieGenre.create({
                data: {
                    movieId: newMovie.id, //collega il genere al film appena creato
                    genre: g,
                },
            });
        }
    }

    return Response.json({ok:true})
}

export async function GET(){
    const movies = await prisma.movie.findMany({ //prendo tutti in film e aggiungo generi e ratings associati
        include: { genres: true, ratings: true },
    });

    return Response.json({ movies })
}
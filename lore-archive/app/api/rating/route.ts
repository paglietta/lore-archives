import {prisma} from "@/lib/prisma";

export async function POST(request: Request){
    const body = await request.json();
    const { movieId, value} = body;

    const existingRating = await prisma.rating.findUnique({
        where: {movieId: movieId},
    });

    let rating;

    if (existingRating){
        rating = await prisma.rating.update({
            where: {movieId: movieId},
            data: {value},
        });
    }else{
        rating = await prisma.rating.create({
            data:{movieId, value},
        });
    }

    return Response.json({ rating });
}
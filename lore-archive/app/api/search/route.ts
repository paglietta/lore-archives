export async function GET(request:Request){
    const {searchParams} = new URL(request.url); //request.url contiene l url chiamato - searchParams è un oggetto tipo Map
    const query = searchParams.get("query") //query è cio che l utente ha scritto

    if(!query){
        return Response.json({results: []}); //no query utente - lista vuota 
    }

    const params = new URLSearchParams({
        api_key: process.env.TMDB_API_KEY!,
        query,
        include_adult: "false", //per evitare robe aliene nella search
    })

    const url = `https://api.themoviedb.org/3/search/multi?${params.toString()}`;

    const [response, animeResponse, mangaResponse] = await Promise.all([
        fetch(url),
        fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=8&order_by=score&sort=desc`),
        fetch(`https://api.jikan.moe/v4/manga?q=${encodeURIComponent(query)}&limit=8&order_by=score&sort=desc`),
    ]);

    const [data, animeData, mangaData] = await Promise.all([
        response.json(),
        animeResponse.ok ? animeResponse.json() : Promise.resolve({ data: [] }),
        mangaResponse.ok ? mangaResponse.json() : Promise.resolve({ data: [] }),
    ]);

    console.log(data);

    const filtered = data.results.filter((item: any) => //array.filter((item) => condizione) - item è il nome della variabile per ogni elemento dell'array
        item.media_type === "movie" || item.media_type === "tv");

    const cleaned = filtered.map((item: any) => ({ //map prende ogni elemento e lo trasforma
        id: item.id,
        title: item.title || item.name,
        overview: item.overview,
        poster: item.poster_path //lo convertiamo in url completo
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : null,
        type: item.media_type,
        releaseDate: item.release_date || item.first_air_date,
    }))

    const animeResults = (animeData?.data ?? []).map((item: any) => ({
        id: item.mal_id,
        title: item.title,
        overview: item.synopsis,
        poster: item.images?.jpg?.image_url ?? null,
        type: "anime",
        releaseDate: item.aired?.from,
    }))

    const mangaResults = (mangaData?.data ?? []).map((item: any) => ({
        id: item.mal_id,
        title: item.title,
        overview: item.synopsis,
        poster: item.images?.jpg?.image_url ?? null,
        type: "manga",
        releaseDate: item.published?.from,
    }))

    return Response.json({ results: [...cleaned, ...animeResults, ...mangaResults] });
}
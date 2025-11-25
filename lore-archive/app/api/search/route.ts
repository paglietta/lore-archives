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

    const response = await fetch(url); 
    const data = await response.json(); //convertiamo la response in json

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

    return Response.json({ results: cleaned });
}
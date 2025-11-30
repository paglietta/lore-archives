import { NextRequest, NextResponse } from "next/server";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const JIKAN_BASE_URL = "https://api.jikan.moe/v4";

export async function GET(req: NextRequest) {
    const query = req.nextUrl.searchParams.get("query");
    const category = req.nextUrl.searchParams.get("category");

    if (!query || query.trim().length === 0) {
        return NextResponse.json({ results: [] });
    }

    try {
        let results: any[] = [];

        if (!category) {
            const [moviesRes, tvRes, animeRes, mangaRes] = await Promise.all([
                fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`),
                fetch(`${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`),
                fetch(`${JIKAN_BASE_URL}/anime?q=${encodeURIComponent(query)}&limit=10`),
                fetch(`${JIKAN_BASE_URL}/manga?q=${encodeURIComponent(query)}&limit=10`),
            ]);

            const moviesData = await moviesRes.json();
            const tvData = await tvRes.json();
            const animeData = await animeRes.json();
            const mangaData = await mangaRes.json();

            const movies = (moviesData.results || []).map((m: any) => ({
                id: m.id,
                title: m.title,
                poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
                releaseDate: m.release_date,
                type: "movie",
                genres: m.genre_ids || [],
            }));

            const tv = (tvData.results || []).map((t: any) => ({
                id: t.id,
                title: t.name,
                poster: t.poster_path ? `https://image.tmdb.org/t/p/w500${t.poster_path}` : null,
                releaseDate: t.first_air_date,
                type: "tv",
                genres: t.genre_ids || [],
            }));

            const anime = (animeData.data || []).map((a: any) => ({
                id: a.mal_id,
                title: a.title,
                poster: a.images?.jpg?.image_url || null,
                releaseDate: a.aired?.from?.substring(0, 10) || null,
                type: "anime",
                genres: a.genres?.map((g: any) => g.name) || [],
            }));

            const manga = (mangaData.data || []).map((m: any) => ({
                id: m.mal_id,
                title: m.title,
                poster: m.images?.jpg?.image_url || null,
                releaseDate: m.published?.from?.substring(0, 10) || null,
                type: "manga",
                genres: m.genres?.map((g: any) => g.name) || [],
            }));

            results = [...movies, ...tv, ...anime, ...manga];
        } else if (category === "MOVIE") {
            const res = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
            const data = await res.json();
            results = (data.results || []).map((m: any) => ({
                id: m.id,
                title: m.title,
                poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
                releaseDate: m.release_date,
                type: "movie",
                genres: m.genre_ids || [],
            }));
        } else if (category === "TV_SERIES") {
            const res = await fetch(`${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
            const data = await res.json();
            results = (data.results || []).map((t: any) => ({
                id: t.id,
                title: t.name,
                poster: t.poster_path ? `https://image.tmdb.org/t/p/w500${t.poster_path}` : null,
                releaseDate: t.first_air_date,
                type: "tv",
                genres: t.genre_ids || [],
            }));
        } else if (category === "ANIME") {
            const res = await fetch(`${JIKAN_BASE_URL}/anime?q=${encodeURIComponent(query)}&limit=20`);
            const data = await res.json();
            results = (data.data || []).map((a: any) => ({
                id: a.mal_id,
                title: a.title,
                poster: a.images?.jpg?.image_url || null,
                releaseDate: a.aired?.from?.substring(0, 10) || null,
                type: "anime",
                genres: a.genres?.map((g: any) => g.name) || [],
            }));
        } else if (category === "MANGA") {
            const res = await fetch(`${JIKAN_BASE_URL}/manga?q=${encodeURIComponent(query)}&limit=20`);
            const data = await res.json();
            results = (data.data || []).map((m: any) => ({
                id: m.mal_id,
                title: m.title,
                poster: m.images?.jpg?.image_url || null,
                releaseDate: m.published?.from?.substring(0, 10) || null,
                type: "manga",
                genres: m.genres?.map((g: any) => g.name) || [],
            }));
        }

        return NextResponse.json({ results });
    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json({ results: [] }, { status: 500 });
    }
}
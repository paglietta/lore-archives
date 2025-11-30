"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { MediaCard } from "@/components/MediaCard";

function TestMoviePageImpl() {
  const [movies, setMovies] = useState<any[]>([]);
  const [ratingValues, setRatingValues] = useState<{ [key: number]: string }>({});
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMovies = useCallback(async () => {
    try {
      const res = await fetch("/api/movie");
      const data = await res.json();
      setMovies(data.movies);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const handleRatingChange = async (movieId: number, newValue: string) => {
    setRatingValues({ ...ratingValues, [movieId]: newValue });

    const value = parseFloat(newValue);
    if (isNaN(value)) return;

    try {
      const res = await fetch("/api/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId, value }),
      });
      const data = await res.json();

      setMovies((prev) =>
        prev.map((m) => (m.id === movieId ? { ...m, ratings: [data.rating] } : m))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMovie = async (movieId: number) => {
    if (!confirm("Are you sure you want to delete this movie?")) return;

    try {
      const res = await fetch(`/api/movie?id=${movieId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMovies((prev) => prev.filter((m) => m.id !== movieId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  type LibraryTarget = {
    endpoint: string;
    category: "MOVIE" | "TV_SERIES" | "ANIME" | "MANGA";
    alreadyExistsMessage: string;
    onSuccess?: () => Promise<void>;
    successMessage?: string;
  };

  type LibraryKey = "movie" | "tv" | "anime" | "manga";

  const isLibraryKey = (value: string): value is LibraryKey =>
    value === "movie" || value === "tv" || value === "anime" || value === "manga";

  const libraryTargets: Record<LibraryKey, LibraryTarget> = {
    movie: {
      endpoint: "/api/movie",
      category: "MOVIE",
      alreadyExistsMessage: "This movie is already in your collection",
      onSuccess: fetchMovies,
    },
    tv: {
      endpoint: "/api/tv-series",
      category: "TV_SERIES",
      alreadyExistsMessage: "This series is already in your collection",
      successMessage: "TV series added. Check the TV Series page.",
    },
    anime: {
      endpoint: "/api/anime",
      category: "ANIME",
      alreadyExistsMessage: "This anime is already in your collection",
      successMessage: "Anime added. Check the Anime page.",
    },
    manga: {
      endpoint: "/api/manga",
      category: "MANGA",
      alreadyExistsMessage: "This manga is already in your collection",
      successMessage: "Manga added. Check the Manga page.",
    },
  };

  const handleAddItem = async (item: any) => {
    const normalizedType = (item.type || "").toLowerCase();
    if (!isLibraryKey(normalizedType)) {
      alert("Only movies, TV series, anime, or manga can be added");
      return;
    }
    const target = libraryTargets[normalizedType];

    if (normalizedType === "movie" && movies.some((m) => m.id === item.id)) {
      alert("This movie is already in your collection");
      return;
    }

    try {
      const res = await fetch(target.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          title: item.title,
          poster: item.poster,
          releaseDate: item.releaseDate,
          category: target.category,
          genres: item.genres ?? [],
        }),
      });

      const data = await res.json();

      if (data.alreadyExists) {
        alert(target.alreadyExistsMessage);
        return;
      }

      await target.onSuccess?.();
      if (target.successMessage) {
        alert(target.successMessage);
      }
    } catch (err) {
      console.error("Error adding item:", err);
    }
  };

  const avgRating =
    movies.length > 0
      ? (movies.reduce((acc, m) => acc + (m.ratings[0]?.value || 0), 0) / movies.length).toFixed(1)
      : "0.0";

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        onSearchResults={setSearchResults}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        category="MOVIE"
      />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {searchResults.length > 0 && (
          <div className="mb-8 space-y-4">
            {searchResults.map((item) => {
              const normalizedType = (item.type || "").toLowerCase();
              const supportedTypes = ["movie", "tv", "anime", "manga"];
              const isSupported = supportedTypes.includes(normalizedType);
              const isAlreadyInMovies =
                normalizedType === "movie" && movies.some((m) => m.id === item.id);

              const buttonLabel = !isSupported
                ? "Unsupported"
                : normalizedType === "movie"
                ? isAlreadyInMovies
                  ? "Added"
                  : "Add to Movies"
                : normalizedType === "tv"
                ? "Add to TV Series"
                : normalizedType === "anime"
                ? "Add to Anime"
                : "Add to Manga";

              return (
                <div
                  key={`${item.type}-${item.id}`}
                  className="flex gap-4 items-center p-4 border border-border rounded-lg bg-card hover:border-primary/50 transition-colors"
                >
                  {item.poster && (
                    <img
                      src={item.poster}
                      alt={item.title}
                      className="w-16 h-24 object-cover rounded"
                    />
                  )}

                  <div className="flex-1">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.type?.toUpperCase()} — {item.releaseDate}
                    </p>
                  </div>

                  <button
                    onClick={() => handleAddItem(item)}
                    disabled={!isSupported || isAlreadyInMovies}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      !isSupported || isAlreadyInMovies
                        ? "bg-secondary text-secondary-foreground cursor-not-allowed opacity-50"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {buttonLabel}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="mb-8 flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight">Movies</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{movies.length} movies</span>
              <span>•</span>
              <span>Avg rating: {avgRating}</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">Filters</div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {movies.map((movie) => (
            <MediaCard
              key={movie.id}
              id={movie.id}
              title={movie.title}
              posterUrl={movie.poster}
              rating={
                ratingValues[movie.id]
                  ? parseFloat(ratingValues[movie.id])
                  : movie.ratings[0]?.value
              }
              ratingInputValue={ratingValues[movie.id]}
              year={movie.releaseDate?.substring(0, 4)}
              onDelete={handleDeleteMovie}
              onRatingChange={handleRatingChange}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

export default dynamic(() => Promise.resolve(TestMoviePageImpl), { ssr: false });

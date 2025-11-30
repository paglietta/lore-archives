"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { MediaCard } from "@/components/MediaCard";

type LibraryTarget = {
  endpoint: string;
  category: "COMIC" | "MOVIE" | "TV_SERIES" | "ANIME" | "MANGA";
  alreadyExistsMessage: string;
  onSuccess?: () => Promise<void>;
  successMessage?: string;
};

type LibraryKey = "comic" | "movie" | "tv" | "anime" | "manga";

const isLibraryKey = (value: string): value is LibraryKey =>
  value === "comic" || value === "movie" || value === "tv" || value === "anime" || value === "manga";

export default function ComicsPage() {
  const [comics, setComics] = useState<any[]>([]);
  const [ratingValues, setRatingValues] = useState<{ [key: number]: string }>({});
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchComics = useCallback(async () => {
    try {
      const res = await fetch("/api/comics");
      const data = await res.json();
      setComics(data.comics);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchComics();
  }, [fetchComics]);

  const handleRatingChange = async (comicId: number, newValue: string) => {
    setRatingValues({ ...ratingValues, [comicId]: newValue });
    
    const value = parseFloat(newValue);
    if (isNaN(value)) return;

    try {
      const res = await fetch("/api/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId: comicId, value }),
      });
      const data = await res.json();
      
      setComics((prev) =>
        prev.map((c) =>
          c.id === comicId ? { ...c, ratings: [data.rating] } : c
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComic = async (comicId: number) => {
    if (!confirm("Are you sure you want to delete this comic?")) return;

    try {
      const res = await fetch(`/api/comics?id=${comicId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setComics((prev) => prev.filter((c) => c.id !== comicId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const avgRating = comics.length > 0 
    ? (comics.reduce((acc, c) => acc + (c.ratings[0]?.value || 0), 0) / comics.length).toFixed(1)
    : "0.0";

  const libraryTargets: Record<LibraryKey, LibraryTarget> = {
    comic: {
      endpoint: "/api/comics",
      category: "COMIC",
      alreadyExistsMessage: "This comic is already in your collection",
      onSuccess: fetchComics,
    },
    movie: {
      endpoint: "/api/movie",
      category: "MOVIE",
      alreadyExistsMessage: "This movie is already in your collection",
      successMessage: "Movie added. Check the Movies page.",
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
      alert("Only movies, TV series, anime, manga, or comics can be added");
      return;
    }
    const target = libraryTargets[normalizedType];

    if (normalizedType === "comic" && comics.some((c) => c.id === item.id)) {
      alert("This comic is already in your collection");
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        onSearchResults={setSearchResults}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        category="COMIC"
      />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {searchResults.length > 0 && (
          <div className="mb-8 space-y-4">
            {searchResults.map((item) => {
              const normalizedType = (item.type || "").toLowerCase();
              const isSupported = isLibraryKey(normalizedType);
              const isAlreadyInComics =
                normalizedType === "comic" && comics.some((c) => c.id === item.id);

              const buttonLabel = (() => {
                switch (normalizedType) {
                  case "comic":
                    return isAlreadyInComics ? "Added" : "Add to Comics";
                  case "movie":
                    return "Add to Movies";
                  case "tv":
                    return "Add to TV Series";
                  case "anime":
                    return "Add to Anime";
                  case "manga":
                    return "Add to Manga";
                  default:
                    return "Unsupported";
                }
              })();

              return (
                <div
                  key={`${item.type ?? "unknown"}-${item.id}`}
                  className="flex gap-4 items-center p-4 border border-border rounded-lg bg-card hover:border-primary/50 transition-colors"
                >
                  {item.poster && (
                    <img src={item.poster} alt={item.title} className="w-16 h-24 object-cover rounded" />
                  )}

                  <div className="flex-1">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.type?.toUpperCase()} — {item.releaseDate}
                    </p>
                  </div>

                  <button
                    onClick={() => handleAddItem(item)}
                    disabled={!isSupported || isAlreadyInComics}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      !isSupported || isAlreadyInComics
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
            <h1 className="text-4xl font-bold tracking-tight">Comics</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{comics.length} comics</span>
              <span>•</span>
              <span>Avg rating: {avgRating}</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Filters
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {comics.map((comic) => (
            <MediaCard
              key={comic.id}
              id={comic.id}
              title={comic.title}
              posterUrl={comic.poster}
              rating={ratingValues[comic.id] ? parseFloat(ratingValues[comic.id]) : comic.ratings[0]?.value}
              year={comic.releaseDate?.substring(0, 4)}
              onDelete={handleDeleteComic}
              onRatingChange={handleRatingChange}
              ratingInputValue={ratingValues[comic.id]}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
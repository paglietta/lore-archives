"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { MediaCard } from "@/components/MediaCard";

export default function AnimePage() {
  const [anime, setAnime] = useState<any[]>([]);
  const [ratingValues, setRatingValues] = useState<{ [key: number]: string }>({});
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        const res = await fetch("/api/anime");
        const data = await res.json();
        setAnime(data.anime);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAnime();
  }, []);

  const handleRatingChange = async (animeId: number, newValue: string) => {
    setRatingValues({ ...ratingValues, [animeId]: newValue });
    
    const value = parseFloat(newValue);
    if (isNaN(value)) return;

    try {
      const res = await fetch("/api/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId: animeId, value }),
      });
      const data = await res.json();
      
      setAnime((prev) =>
        prev.map((a) =>
          a.id === animeId ? { ...a, ratings: [data.rating] } : a
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAnime = async (animeId: number) => {
    if (!confirm("Are you sure you want to delete this anime?")) return;

    try {
      const res = await fetch(`/api/anime?id=${animeId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setAnime((prev) => prev.filter((a) => a.id !== animeId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const avgRating = anime.length > 0 
    ? (anime.reduce((acc, a) => acc + (a.ratings[0]?.value || 0), 0) / anime.length).toFixed(1)
    : "0.0";

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        onSearchResults={setSearchResults}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight">Anime</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{anime.length} anime</span>
              <span>•</span>
              <span>Avg rating: {avgRating}</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Filters
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {anime.map((item) => (
            <MediaCard
              key={item.id}
              id={item.id}
              title={item.title}
              posterUrl={item.poster}
              rating={ratingValues[item.id] ? parseFloat(ratingValues[item.id]) : item.ratings[0]?.value}
              year={item.releaseDate?.substring(0, 4)}
              onDelete={handleDeleteAnime}
              onRatingChange={handleRatingChange}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
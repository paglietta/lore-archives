"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { MediaCard } from "@/components/MediaCard";

export default function ComicsPage() {
  const [comics, setComics] = useState<any[]>([]);
  const [ratingValues, setRatingValues] = useState<{ [key: number]: string }>({});
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchComics = async () => {
      try {
        const res = await fetch("/api/comics");
        const data = await res.json();
        setComics(data.comics);
      } catch (err) {
        console.error(err);
      }
    };

    fetchComics();
  }, []);

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
            />
          ))}
        </div>
      </main>
    </div>
  );
}
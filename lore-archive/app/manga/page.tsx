"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { MediaCard } from "@/components/MediaCard";

export default function MangaPage() {
  const [manga, setManga] = useState<any[]>([]);
  const [ratingValues, setRatingValues] = useState<{ [key: number]: string }>({});
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchManga = async () => {
      try {
        const res = await fetch("/api/manga");
        const data = await res.json();
        setManga(data.manga);
      } catch (err) {
        console.error(err);
      }
    };

    fetchManga();
  }, []);

  const handleRatingChange = async (mangaId: number, newValue: string) => {
    setRatingValues({ ...ratingValues, [mangaId]: newValue });
    
    const value = parseFloat(newValue);
    if (isNaN(value)) return;

    try {
      const res = await fetch("/api/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId: mangaId, value }),
      });
      const data = await res.json();
      
      setManga((prev) =>
        prev.map((m) =>
          m.id === mangaId ? { ...m, ratings: [data.rating] } : m
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteManga = async (mangaId: number) => {
    if (!confirm("Are you sure you want to delete this manga?")) return;

    try {
      const res = await fetch(`/api/manga?id=${mangaId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setManga((prev) => prev.filter((m) => m.id !== mangaId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const avgRating = manga.length > 0 
    ? (manga.reduce((acc, m) => acc + (m.ratings[0]?.value || 0), 0) / manga.length).toFixed(1)
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
            <h1 className="text-4xl font-bold tracking-tight">Manga</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{manga.length} manga</span>
              <span>•</span>
              <span>Avg rating: {avgRating}</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Filters
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {manga.map((item) => (
            <MediaCard
              key={item.id}
              id={item.id}
              title={item.title}
              posterUrl={item.poster}
              rating={ratingValues[item.id] ? parseFloat(ratingValues[item.id]) : item.ratings[0]?.value}
              year={item.releaseDate?.substring(0, 4)}
              onDelete={handleDeleteManga}
              onRatingChange={handleRatingChange}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
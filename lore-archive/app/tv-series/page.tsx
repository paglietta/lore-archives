"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { MediaCard } from "@/components/MediaCard";

export default function TVSeriesPage() {
  const [tvSeries, setTVSeries] = useState<any[]>([]);
  const [ratingValues, setRatingValues] = useState<{ [key: number]: string }>({});
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchTVSeries = async () => {
      try {
        const res = await fetch("/api/tv-series");
        const data = await res.json();
        setTVSeries(data.tvSeries);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTVSeries();
  }, []);

  const handleRatingChange = async (seriesId: number, newValue: string) => {
    setRatingValues({ ...ratingValues, [seriesId]: newValue });
    
    const value = parseFloat(newValue);
    if (isNaN(value)) return;

    try {
      const res = await fetch("/api/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId: seriesId, value }),
      });
      const data = await res.json();
      
      setTVSeries((prev) =>
        prev.map((s) =>
          s.id === seriesId ? { ...s, ratings: [data.rating] } : s
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSeries = async (seriesId: number) => {
    if (!confirm("Are you sure you want to delete this TV series?")) return;

    try {
      const res = await fetch(`/api/tv-series?id=${seriesId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setTVSeries((prev) => prev.filter((s) => s.id !== seriesId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const avgRating = tvSeries.length > 0 
    ? (tvSeries.reduce((acc, s) => acc + (s.ratings[0]?.value || 0), 0) / tvSeries.length).toFixed(1)
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
            <h1 className="text-4xl font-bold tracking-tight">TV Series</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{tvSeries.length} series</span>
              <span>•</span>
              <span>Avg rating: {avgRating}</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Filters
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {tvSeries.map((series) => (
            <MediaCard
              key={series.id}
              id={series.id}
              title={series.title}
              posterUrl={series.poster}
              rating={ratingValues[series.id] ? parseFloat(ratingValues[series.id]) : series.ratings[0]?.value}
              year={series.releaseDate?.substring(0, 4)}
              onDelete={handleDeleteSeries}
              onRatingChange={handleRatingChange}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
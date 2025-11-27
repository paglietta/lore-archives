"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { MediaCard } from "@/components/MediaCard";

export default function TVSeriesPage() {
  const [tvSeries, setTVSeries] = useState<any[]>([]);
  const [ratingValues, setRatingValues] = useState<{ [key: number]: string }>({});
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTVSeries = useCallback(async () => {
    try {
      const res = await fetch("/api/tv-series");
      const data = await res.json();
      setTVSeries(data.tvSeries);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchTVSeries();
  }, [fetchTVSeries]);

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
        prev.map((s) => (s.id === seriesId ? { ...s, ratings: [data.rating] } : s))
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

  const handleAddItem = async (item: any) => {
    const normalizedType = (item.type || "").toLowerCase();
    const isTvSeries = normalizedType === "tv";
    const isMovie = normalizedType === "movie";

    if (!isTvSeries && !isMovie) {
      alert("Only movies or TV series can be added");
      return;
    }

    if (isTvSeries && tvSeries.some((s) => s.id === item.id)) {
      alert("This series is already in your collection");
      return;
    }

    try {
      const endpoint = isTvSeries ? "/api/tv-series" : "/api/movie";
      const category = isTvSeries ? "TV_SERIES" : "MOVIE";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          title: item.title,
          poster: item.poster,
          releaseDate: item.releaseDate,
          category,
          genres: item.genres ?? [],
        }),
      });

      const data = await res.json();

      if (data.alreadyExists) {
        alert(
          isTvSeries
            ? "This series is already in your collection"
            : "This movie is already in your collection"
        );
        return;
      }

      if (isTvSeries) {
        await fetchTVSeries();
      } else {
        alert("Movie added. Check the Movies page.");
      }
    } catch (err) {
      console.error("Error adding item:", err);
    }
  };

  const avgRating =
    tvSeries.length > 0
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
        {searchResults.length > 0 && (
          <div className="mb-8 space-y-4">
            {searchResults.map((item) => {
              const normalizedType = (item.type || "").toLowerCase();
              const isTvSeriesResult = normalizedType === "tv";
              const isMovieResult = normalizedType === "movie";
              const isSupported = isTvSeriesResult || isMovieResult;
              const isAlreadyInSeries = isTvSeriesResult && tvSeries.some((s) => s.id === item.id);

              const buttonLabel = !isSupported
                ? "Unsupported"
                : isTvSeriesResult
                ? isAlreadyInSeries
                  ? "Added"
                  : "Add to TV Series"
                : "Add to Movies";

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
                    disabled={!isSupported || isAlreadyInSeries}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      !isSupported || isAlreadyInSeries
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
            <h1 className="text-4xl font-bold tracking-tight">TV Series</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{tvSeries.length} series</span>
              <span>•</span>
              <span>Avg rating: {avgRating}</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">Filters</div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {tvSeries.map((series) => (
            <MediaCard
              key={series.id}
              id={series.id}
              title={series.title}
              posterUrl={series.poster}
              rating={
                ratingValues[series.id]
                  ? parseFloat(ratingValues[series.id])
                  : series.ratings[0]?.value
              }
              ratingInputValue={ratingValues[series.id]}
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
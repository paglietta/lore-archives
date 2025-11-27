"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";

export default function HomePage() {
  const [navbarSearchResults, setNavbarSearchResults] = useState<any[]>([]);
  const [navbarSearchQuery, setNavbarSearchQuery] = useState("");
  const [homeSearchResults, setHomeSearchResults] = useState<any[]>([]);
  const [homeSearchQuery, setHomeSearchQuery] = useState("");
  const [stats, setStats] = useState({
    movies: 0,
    tvSeries: 0,
    anime: 0,
    books: 0,
    manga: 0,
    comics: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/movie");
        const data = await res.json();
        setStats({
          ...stats,
          movies: data.movies.length,
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    if (!homeSearchQuery || homeSearchQuery.length < 3) {
      setHomeSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?query=${encodeURIComponent(homeSearchQuery)}`
        );
        if (!res.ok) throw new Error("search failed");
        const data = await res.json();
        setHomeSearchResults(data.results ?? []);
      } catch (err) {
        console.error("search error", err);
        setHomeSearchResults([]);
      }
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [homeSearchQuery]);

  const handleAddMovie = async (item: any) => {
    try {
      const body = {
        id: item.id,
        title: item.title,
        poster: item.poster,
        releaseDate: item.releaseDate,
        category: "MOVIE",
        genres: [],
      };

      const res = await fetch("/api/movie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.alreadyExists) {
        alert("This movie is already in your collection");
      } else {
        const statsRes = await fetch("/api/movie");
        const statsData = await statsRes.json();
        setStats({
          ...stats,
          movies: statsData.movies.length,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const allSearchResults = [...navbarSearchResults, ...homeSearchResults];
  const uniqueSearchResults = Array.from(
    new Map(allSearchResults.map((item) => [item.id, item])).values()
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        onSearchResults={setNavbarSearchResults}
        searchQuery={navbarSearchQuery}
        onSearchQueryChange={setNavbarSearchQuery}
      />

      <main className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] -mt-16">
          <div className="text-center space-y-6 max-w-2xl w-full">
            <div className="space-y-3">
              <h1 className="text-6xl font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Discover
              </h1>
              <p className="text-muted-foreground text-lg">
                Explore and track your collection of movies, TV series, anime, books
                and comics
              </p>
            </div>

            <div className="relative w-full mt-8">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                value={homeSearchQuery}
                onChange={(e) => setHomeSearchQuery(e.target.value)}
                className="w-full pl-12 h-14 text-lg bg-card border-border/50 focus-visible:ring-primary shadow-lg"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-12">
              <div className="p-4 rounded-lg border border-border/50 bg-card/50 hover:border-primary/50 transition-colors cursor-pointer">
                <div className="text-2xl font-bold text-primary">{stats.movies}</div>
                <div className="text-sm text-muted-foreground">Movies</div>
              </div>
              <div className="p-4 rounded-lg border border-border/50 bg-card/50 hover:border-primary/50 transition-colors cursor-pointer">
                <div className="text-2xl font-bold text-primary">{stats.tvSeries}</div>
                <div className="text-sm text-muted-foreground">TV Series</div>
              </div>
              <div className="p-4 rounded-lg border border-border/50 bg-card/50 hover:border-primary/50 transition-colors cursor-pointer">
                <div className="text-2xl font-bold text-primary">{stats.anime}</div>
                <div className="text-sm text-muted-foreground">Anime</div>
              </div>
              <div className="p-4 rounded-lg border border-border/50 bg-card/50 hover:border-primary/50 transition-colors cursor-pointer">
                <div className="text-2xl font-bold text-primary">{stats.books}</div>
                <div className="text-sm text-muted-foreground">Books</div>
              </div>
              <div className="p-4 rounded-lg border border-border/50 bg-card/50 hover:border-primary/50 transition-colors cursor-pointer">
                <div className="text-2xl font-bold text-primary">{stats.manga}</div>
                <div className="text-sm text-muted-foreground">Manga</div>
              </div>
              <div className="p-4 rounded-lg border border-border/50 bg-card/50 hover:border-primary/50 transition-colors cursor-pointer">
                <div className="text-2xl font-bold text-primary">{stats.comics}</div>
                <div className="text-sm text-muted-foreground">Comics</div>
              </div>
            </div>

            {uniqueSearchResults.length > 0 && (
              <div className="mt-12 space-y-4 w-full max-w-4xl">
                <h2 className="text-2xl font-bold text-left">Search Results</h2>
                {uniqueSearchResults.map((item) => (
                  <div
                    key={item.id}
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
                        {item.type.toUpperCase()} — {item.releaseDate}
                      </p>
                    </div>

                    <button
                      onClick={() => handleAddMovie(item)}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

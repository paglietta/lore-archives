"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { MediaCard } from "@/components/MediaCard";

type LibraryTarget = {
  endpoint: string;
  category: "BOOK" | "MOVIE" | "TV_SERIES" | "ANIME" | "MANGA";
  alreadyExistsMessage: string;
  onSuccess?: () => Promise<void>;
  successMessage?: string;
};

type LibraryKey = "book" | "movie" | "tv" | "anime" | "manga";

const isLibraryKey = (value: string): value is LibraryKey =>
  value === "book" || value === "movie" || value === "tv" || value === "anime" || value === "manga";

export default function BooksPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [ratingValues, setRatingValues] = useState<{ [key: number]: string }>({});
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchBooks = useCallback(async () => {
    try {
      const res = await fetch("/api/books");
      const data = await res.json();
      setBooks(data.books);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const libraryTargets: Record<LibraryKey, LibraryTarget> = {
    book: {
      endpoint: "/api/books",
      category: "BOOK",
      alreadyExistsMessage: "This book is already in your collection",
      onSuccess: fetchBooks,
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

  const handleRatingChange = async (bookId: number, newValue: string) => {
    setRatingValues({ ...ratingValues, [bookId]: newValue });
    
    const value = parseFloat(newValue);
    if (isNaN(value)) return;

    try {
      const res = await fetch("/api/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId: bookId, value }),
      });
      const data = await res.json();
      
      setBooks((prev) =>
        prev.map((b) =>
          b.id === bookId ? { ...b, ratings: [data.rating] } : b
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBook = async (bookId: number) => {
    if (!confirm("Are you sure you want to delete this book?")) return;

    try {
      const res = await fetch(`/api/books?id=${bookId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setBooks((prev) => prev.filter((b) => b.id !== bookId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddItem = async (item: any) => {
    const normalizedType = (item.type || "").toLowerCase();
    if (!isLibraryKey(normalizedType)) {
      alert("Only movies, TV series, anime, manga, or books can be added");
      return;
    }
    const target = libraryTargets[normalizedType];

    if (normalizedType === "book" && books.some((b) => b.id === item.id)) {
      alert("This book is already in your collection");
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

  const avgRating = books.length > 0 
    ? (books.reduce((acc, b) => acc + (b.ratings[0]?.value || 0), 0) / books.length).toFixed(1)
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
              const isSupported = isLibraryKey(normalizedType);
              const isAlreadyInBooks = normalizedType === "book" && books.some((b) => b.id === item.id);

              const buttonLabel = (() => {
                switch (normalizedType) {
                  case "book":
                    return isAlreadyInBooks ? "Added" : "Add to Books";
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
                    disabled={!isSupported || isAlreadyInBooks}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      !isSupported || isAlreadyInBooks
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
            <h1 className="text-4xl font-bold tracking-tight">Books</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{books.length} books</span>
              <span>•</span>
              <span>Avg rating: {avgRating}</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Filters
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {books.map((book) => (
            <MediaCard
              key={book.id}
              id={book.id}
              title={book.title}
              posterUrl={book.poster}
              rating={ratingValues[book.id] ? parseFloat(ratingValues[book.id]) : book.ratings[0]?.value}
              year={book.releaseDate?.substring(0, 4)}
              onDelete={handleDeleteBook}
              onRatingChange={handleRatingChange}
              ratingInputValue={ratingValues[book.id]}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
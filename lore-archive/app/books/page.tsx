"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { MediaCard } from "@/components/MediaCard";

export default function BooksPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [ratingValues, setRatingValues] = useState<{ [key: number]: string }>({});
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch("/api/books");
        const data = await res.json();
        setBooks(data.books);
      } catch (err) {
        console.error(err);
      }
    };

    fetchBooks();
  }, []);

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
            />
          ))}
        </div>
      </main>
    </div>
  );
}
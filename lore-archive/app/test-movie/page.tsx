"use client";

import { useState, useEffect } from "react";

export default function TestMoviePage() {
  const [title, setTitle] = useState("");
  const [poster, setPoster] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [category, setCategory] = useState("MOVIE");
  const [genres, setGenres] = useState("");
  const [message, setMessage] = useState("");
  const [movies, setMovies] = useState<any[]>([]);
  const [ratingValues, setRatingValues] = useState<{ [key: number]: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const genresArray = genres
      .split(",")
      .map((g) => g.trim())
      .filter((g) => g.length > 0);

    const body = {
      id: Math.floor(Math.random() * 1000000),
      title,
      poster,
      releaseDate,
      category,
      genres: genresArray,
    };

    try {
      const res = await fetch("/api/movie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      console.log(data);
      setMessage("movie added");
    } catch (err) {
      console.error(err);
      setMessage("error");
    }
  };

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch("/api/movie");
        const data = await res.json();
        setMovies(data.movies);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMovies();
  }, []);

  const handleRatingSubmit = async (movieId: number) => {
    const value = parseFloat(ratingValues[movieId]);
    if (isNaN(value)) return;

    try {
      const res = await fetch("/api/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId, value }),
      });
      const data = await res.json();
      console.log("rating updated:", data);
      
      setMovies((prev) =>
        prev.map((m) =>
          m.id === movieId ? { ...m, ratings: [data.rating] } : m
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label>Poster URL:</label>
          <input
            type="text"
            value={poster}
            onChange={(e) => setPoster(e.target.value)}
          />
        </div>

        <div>
          <label>Date:</label>
          <input
            type="date"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
          />
        </div>

        <div>
          <label>Category:</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="MOVIE">Movie</option>
            <option value="TV">TV</option>
            <option value="ANIME">Anime</option>
            <option value="MANGA">Manga</option>
            <option value="BOOK">Book</option>
            <option value="COMIC">Comic</option>
          </select>
        </div>

        <div>
          <label>Genres (separati da virgola):</label>
          <input
            type="text"
            value={genres}
            onChange={(e) => setGenres(e.target.value)}
          />
        </div>

        <button type="submit">Save</button>
        {message && <p>{message}</p>}
      </form>

      <h2>Film aggiunti</h2>
      <div>
        {movies.map((movie) => (
          <div
            key={movie.id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            <h3>{movie.title}</h3>
            {movie.poster && (
              <img
                src={movie.poster}
                alt={movie.title}
                style={{ width: "100px" }}
              />
            )}
            <p>Category: {movie.category}</p>
            <p>Genres: {movie.genres.map((g: any) => g.genre).join(", ")}</p>
            
            <div>
              <label>Rating:</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={ratingValues[movie.id] ?? (movie.ratings[0]?.value ?? "")}
                onChange={(e) =>
                  setRatingValues({ ...ratingValues, [movie.id]: e.target.value })
                }
              />
              <button onClick={() => handleRatingSubmit(movie.id)}>
                Save Rating
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
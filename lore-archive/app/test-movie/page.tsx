"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar"; 

export default function TestMoviePage() {
  const [title, setTitle] = useState("");
  const [poster, setPoster] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [category, setCategory] = useState("MOVIE");
  const [genres, setGenres] = useState("");
  const [message, setMessage] = useState("");
  const [movies, setMovies] = useState<any[]>([]);
  const [ratingValues, setRatingValues] = useState<{ [key: number]: string }>({});
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [hoveredMovieId, setHoveredMovieId] = useState<number | null>(null);

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

  const handleRatingChange = async (movieId: number, newValue: string) => {
    setRatingValues({ ...ratingValues, [movieId]: newValue });
    
    const value = parseFloat(newValue);
    if (isNaN(value)) return;

    try {
      const res = await fetch("/api/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId, value }),
      });
      const data = await res.json();
      
      setMovies((prev) =>
        prev.map((m) =>
          m.id === movieId ? { ...m, ratings: [data.rating] } : m
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMovie = async (movieId: number) => {
    if (!confirm("Sei sicuro di voler eliminare questo film?")) return;

    try {
      const res = await fetch(`/api/movie?id=${movieId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMovies((prev) => prev.filter((m) => m.id !== movieId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <Navbar onSearchResults={setSearchResults} />

      <div style={{ padding: "0 20px" }}>
        <div>
          {searchResults.map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid #444",
                padding: "10px",
                marginBottom: "10px",
                display: "flex",
                gap: "10px",
                alignItems: "center"
              }}
            >
              {item.poster && (
                <img
                  src={item.poster}
                  alt={item.title}
                  style={{ width: "60px", borderRadius: "4px" }}
                />
              )}

              <div>
                <h3 style={{ margin: 0 }}>{item.title}</h3>
                <p style={{ margin: 0, fontSize: "14px", opacity: 0.7 }}>
                  {item.type.toUpperCase()} — {item.releaseDate}
                </p>

                <button
                  style={{ marginTop: "5px" }}
                  onClick={async () => {
                    try {
                      const body = {
                        id: Math.floor(Math.random() * 1000000),
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
                      console.log("added:", data);

                      setMessage(`${item.title} aggiunto`);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "30px",
            marginBottom: "30px"
          }}>
            <span style={{
              fontSize: "18px",
              fontWeight: "500",
              cursor: "pointer",
              color: "#333"
            }}>
              Movies
            </span>
            <span style={{
              fontSize: "18px",
              fontWeight: "500",
              cursor: "pointer",
              color: "#999"
            }}>
              Anime
            </span>
            <span style={{
              fontSize: "18px",
              fontWeight: "500",
              cursor: "pointer",
              color: "#999"
            }}>
              TV Series
            </span>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 150px))",
            gap: "20px",
            justifyContent: "start"
          }}>
            {movies.map((movie) => (
              <div
                key={movie.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center"
                }}
              >
                <div 
                  style={{ position: "relative" }}
                  onMouseEnter={() => setHoveredMovieId(movie.id)}
                  onMouseLeave={() => setHoveredMovieId(null)}
                >
                  {movie.poster && (
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      style={{ 
                        width: "150px",
                        height: "225px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        marginBottom: "8px"
                      }}
                    />
                  )}
                  
                  {hoveredMovieId === movie.id && (
                    <button
                      onClick={() => handleDeleteMovie(movie.id)}
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        background: "rgba(255, 0, 0, 0.8)",
                        border: "none",
                        borderRadius: "50%",
                        width: "32px",
                        height: "32px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                        color: "white"
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
                
                <h3 style={{ 
                  margin: "0 0 8px 0",
                  fontSize: "14px",
                  fontWeight: "600"
                }}>
                  {movie.title}
                </h3>
                
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={ratingValues[movie.id] ?? (movie.ratings[0]?.value ?? "")}
                  onChange={(e) => handleRatingChange(movie.id, e.target.value)}
                  style={{
                    width: "60px",
                    padding: "4px",
                    textAlign: "center",
                    border: "1px solid #ccc",
                    borderRadius: "4px"
                  }}
                  placeholder="Rating"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

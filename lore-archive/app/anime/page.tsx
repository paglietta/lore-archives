"use client"

import { useState, useEffect, useCallback } from "react"
import Navbar from "@/components/Navbar"
import { MediaCard } from "@/components/MediaCard"

type LibraryTarget = {
  endpoint: string
  category: "ANIME" | "MOVIE" | "TV_SERIES" | "MANGA"
  alreadyExistsMessage: string
  onSuccess?: () => Promise<void>
  successMessage?: string
}

type LibraryKey = "anime" | "movie" | "tv" | "manga"

const isLibraryKey = (value: string): value is LibraryKey =>
  value === "anime" || value === "movie" || value === "tv" || value === "manga"

export default function AnimePage() {
  const [anime, setAnime] = useState<any[]>([])
  const [ratingValues, setRatingValues] = useState<{ [key: number]: string }>({})
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const fetchAnime = useCallback(async () => {
    try {
      const res = await fetch("/api/anime")
      const data = await res.json()
      setAnime(data.anime)
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    fetchAnime()
  }, [fetchAnime])

  const handleRatingChange = async (animeId: number, newValue: string) => {
    setRatingValues({ ...ratingValues, [animeId]: newValue })

    const value = parseFloat(newValue)
    if (isNaN(value)) return

    try {
      const res = await fetch("/api/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId: animeId, value }),
      })
      const data = await res.json()

      setAnime((prev) =>
        prev.map((a) => (a.id === animeId ? { ...a, ratings: [data.rating] } : a))
      )
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteAnime = async (animeId: number) => {
    if (!confirm("Are you sure you want to delete this anime?")) return

    try {
      const res = await fetch(`/api/anime?id=${animeId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setAnime((prev) => prev.filter((a) => a.id !== animeId))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const libraryTargets: Record<LibraryKey, LibraryTarget> = {
    anime: {
      endpoint: "/api/anime",
      category: "ANIME",
      alreadyExistsMessage: "This anime is already in your collection",
      onSuccess: fetchAnime,
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
    manga: {
      endpoint: "/api/manga",
      category: "MANGA",
      alreadyExistsMessage: "This manga is already in your collection",
      successMessage: "Manga added. Check the Manga page.",
    },
  }

  const handleAddItem = async (item: any) => {
    const normalizedType = (item.type || "").toLowerCase()
    if (!isLibraryKey(normalizedType)) {
      alert("Only movies, TV series, anime, or manga can be added")
      return
    }
    const target = libraryTargets[normalizedType]

    if (normalizedType === "anime" && anime.some((a) => a.id === item.id)) {
      alert("This anime is already in your collection")
      return
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
      })

      const data = await res.json()

      if (data.alreadyExists) {
        alert(target.alreadyExistsMessage)
        return
      }

      await target.onSuccess?.()
      if (target.successMessage) {
        alert(target.successMessage)
      }
    } catch (err) {
      console.error("Error adding item:", err)
    }
  }

  const avgRating =
    anime.length > 0
      ? (anime.reduce((acc, a) => acc + (a.ratings[0]?.value || 0), 0) / anime.length).toFixed(1)
      : "0.0"

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        onSearchResults={setSearchResults}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        category="ANIME"
      />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {searchResults.length > 0 && (
          <div className="mb-8 space-y-4">
            {searchResults.map((item) => {
              const normalizedType = (item.type || "").toLowerCase()
              const isSupported = isLibraryKey(normalizedType)
              const isAlreadyInAnime = normalizedType === "anime" && anime.some((a) => a.id === item.id)

              const buttonLabel = (() => {
                switch (normalizedType) {
                  case "anime":
                    return isAlreadyInAnime ? "Added" : "Add to Anime"
                  case "movie":
                    return "Add to Movies"
                  case "tv":
                    return "Add to TV Series"
                  case "manga":
                    return "Add to Manga"
                  default:
                    return "Unsupported"
                }
              })()

              return (
                <div
                  key={`${item.type ?? "unknown"}-${item.id}`}
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
                    disabled={!isSupported || isAlreadyInAnime}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      !isSupported || isAlreadyInAnime
                        ? "bg-secondary text-secondary-foreground cursor-not-allowed opacity-50"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {buttonLabel}
                  </button>
                </div>
              )
            })}
          </div>
        )}

        <div className="mb-8 flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight">Anime</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{anime.length} anime</span>
              <span>•</span>
              <span>Avg rating: {avgRating}</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">Filters</div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {anime.map((item) => (
            <MediaCard
              key={item.id}
              id={item.id}
              title={item.title}
              posterUrl={item.poster}
              rating={
                ratingValues[item.id] ? parseFloat(ratingValues[item.id]) : item.ratings[0]?.value
              }
              ratingInputValue={ratingValues[item.id]}
              year={item.releaseDate?.substring(0, 4)}
              onDelete={handleDeleteAnime}
              onRatingChange={handleRatingChange}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
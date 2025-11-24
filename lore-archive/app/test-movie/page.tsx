"use client";

import { useState } from "react";

export default function TestMoviePage(){
    const [title, setTitle] = useState("");
    const [poster, setPoster] = useState("");
    const [releaseDate, setReleaseDate] = useState("");
    const [category, setCategory] = useState("MOVIE");
    const [genres, setGenres] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); //per evitare il comportamento def del form ed evitare di perdere i dati al submit

        const genresArray = genres
            .split(",")
            .map((g) => g.trim()) //rimuove spazi
            .filter((g) => g.length > 0); //elimina stringhe vuote

        const body = { //json per il be
            id: Math.floor(Math.random()* 1000000),
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
    }



    return(
        <form onSubmit={handleSubmit}>
            <div>
                <label>Title:</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)} //aggiorna lo stato ogni volta che scrivo
                />
            </div>
            <button type="submit">Save</button>
            {message && <p>{message}</p>}

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
        </form>
    )
}
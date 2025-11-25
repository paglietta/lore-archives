"use client";

import { useState, useRef, useEffect } from "react";

interface NavbarProps { //con questa ricevo i callback
    onSearchResults: (results: any[]) => void;
}

export default function Navbar({ onSearchResults }: NavbarProps) {
    const [searchQuery, setSearchQuery] = useState("");

    //key: query, value: array di risultati
    const searchCache = useRef<Map<string, any[]>>(new Map()); //map in memoria che salva query già cercate
    const debounceRef = useRef<number | null>(null);
    const abortRef = useRef<AbortController | null>(null); //annulla la fetch corrente se l'utente digita un'altra lettera

    //se la query è vuota/short non facciamo fetch
    useEffect(() => {
        if (!searchQuery || searchQuery.length < 3) {
            onSearchResults([]);
            if (abortRef.current) { //puliamo la fetch in corso
                abortRef.current.abort();
                abortRef.current = null;
            }
            if (debounceRef.current) { //puliamo eventuali timeout
                clearTimeout(debounceRef.current);
                debounceRef.current = null;
            }
            return;
        }

        //puliamo eventuali timeout precedenti
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        //impostiamo un nuovo timeout
        debounceRef.current = window.setTimeout(async () => {
            //se esiste una fetch in corso, annulliamola
            if (abortRef.current) {
                abortRef.current.abort();
            }
            const ac = new AbortController();
            abortRef.current = ac;

            try {
                const res = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`, {
                    signal: ac.signal
                });
                if (!res.ok) throw new Error("search failed");
                const data = await res.json();
                const results = data.results ?? [];

                //salviamo in cache e passiamo al parent
                searchCache.current.set(searchQuery, results);
                onSearchResults(results);
                abortRef.current = null;
            } catch (err: any) {
                if (err.name === "AbortError") return; 
                console.error("search error", err);
                onSearchResults([]);
                abortRef.current = null;
            }
        }, 350); 

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
                debounceRef.current = null;
            }
        };
    }, [searchQuery, onSearchResults]);

    return (
        <div style={{
            padding: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #e0e0e0",
            marginBottom: "40px"
        }}>
            <div style={{
                fontSize: "16px",
                fontWeight: "500",
                color: "#333",
                cursor: "pointer"
            }}>
                Watchlist
            </div>

            <input
                type="text"
                placeholder="Search a movie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} //aggiorna lo stato ogni volta che l'utente scrive
                style={{
                    width: "100%",
                    maxWidth: "500px",
                    padding: "12px 24px",
                    borderRadius: "50px",
                    border: "2px solid #ccc",
                    outline: "none",
                    fontSize: "16px"
                }}
            />

            <div style={{ width: "80px" }}></div>
        </div>
    );
}

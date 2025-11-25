"use client"

import { useState, useRef, useEffect } from "react"
import { Search, Film, Tv, Book, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

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
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center px-4 mx-auto max-w-7xl">
                <Link href="/" className="flex items-center gap-2 mr-6 hover:opacity-80 transition-opacity">
                    <Film className="h-6 w-6 text-primary" />
                    <span className="font-semibold text-lg tracking-tight">Lore Archives</span>
                </Link>

                <div className="hidden md:flex items-center gap-1 mr-auto">
                    <Link href="/test-movie">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <Film className="h-4 w-4" />
                            Movies
                        </Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="gap-2">
                        <Tv className="h-4 w-4" />
                        TV Series
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2">
                        <Tv className="h-4 w-4" />
                        Anime
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2">
                        <Book className="h-4 w-4" />
                        Books
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2">
                        <Book className="h-4 w-4" />
                        Manga
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2">
                        <Book className="h-4 w-4" />
                        Comics
                    </Button>
                </div>

                <div className="hidden md:flex flex-1 max-w-md mx-4">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)} //aggiorna lo stato ogni volta che l'utente scrive
                            className="w-full pl-9 bg-secondary/50 border-border/50 focus-visible:ring-primary"
                        />
                    </div>
                </div>

                <div className="flex md:hidden ml-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem asChild>
                                <Link href="/test-movie" className="gap-2">
                                    <Film className="h-4 w-4" />
                                    Film
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Tv className="h-4 w-4" />
                                Serie TV
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Tv className="h-4 w-4" />
                                Anime
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Book className="h-4 w-4" />
                                Libri
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Book className="h-4 w-4" />
                                Manga
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Book className="h-4 w-4" />
                                Fumetti
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <Button variant="ghost" size="icon" className="md:hidden ml-2">
                    <Search className="h-5 w-5" />
                </Button>
            </div>

            <div className="md:hidden px-4 pb-4">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                        type="search" 
                        placeholder="Search..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)} //aggiorna lo stato ogni volta che l'utente scrive
                        className="w-full pl-9 bg-secondary/50 border-border/50" 
                    />
                </div>
            </div>
        </nav>
    )
}

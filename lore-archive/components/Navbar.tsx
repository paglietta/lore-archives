"use client"

import { useState, useRef, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Search, Film, Tv, Book, Menu, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

interface NavbarProps {
    onSearchResults: (results: any[]) => void;
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
}

interface SessionUser {
    id: string;
    username: string;
    displayName: string;
}

export default function Navbar({ onSearchResults, searchQuery, onSearchQueryChange }: NavbarProps) {
    const searchCache = useRef<Map<string, any[]>>(new Map())
    const debounceRef = useRef<number | null>(null)
    const abortRef = useRef<AbortController | null>(null)
    const router = useRouter()
    const pathname = usePathname()
    const [sessionUser, setSessionUser] = useState<SessionUser | null>(null)
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    useEffect(() => {
        if (!searchQuery || searchQuery.length < 3) {
            onSearchResults([])
            if (abortRef.current) {
                abortRef.current.abort()
                abortRef.current = null
            }
            if (debounceRef.current) {
                clearTimeout(debounceRef.current)
                debounceRef.current = null
            }
            return
        }

        if (debounceRef.current) {
            clearTimeout(debounceRef.current)
        }

        debounceRef.current = window.setTimeout(async () => {
            if (abortRef.current) {
                abortRef.current.abort()
            }
            const ac = new AbortController()
            abortRef.current = ac

            try {
                const res = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`, {
                    signal: ac.signal
                })
                if (!res.ok) throw new Error("search failed")
                const data = await res.json()
                const results = data.results ?? []

                searchCache.current.set(searchQuery, results)
                onSearchResults(results)
                abortRef.current = null
            } catch (err: any) {
                if (err.name === "AbortError") return
                console.error("search error", err)
                onSearchResults([])
                abortRef.current = null
            }
        }, 350)

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current)
                debounceRef.current = null
            }
        }
    }, [searchQuery, onSearchResults])

    useEffect(() => {
        let isActive = true
        const controller = new AbortController()

        async function loadSession() {
            try {
                const res = await fetch("/api/auth/session", {
                    cache: "no-store",
                    signal: controller.signal,
                })

                if (!res.ok) {
                    if (isActive) setSessionUser(null)
                    return
                }

                const data = await res.json()
                if (isActive) {
                    setSessionUser(data.user ?? null)
                }
            } catch (error: any) {
                if (error?.name !== "AbortError" && isActive) {
                    setSessionUser(null)
                }
            }
        }

        loadSession()

        return () => {
            isActive = false
            controller.abort()
        }
    }, [pathname])

    const handleLogout = async () => {
        if (isLoggingOut) return

        setIsLoggingOut(true)
        try {
            await fetch("/api/auth/login", { method: "DELETE" })
            setSessionUser(null)
            router.refresh()
        } catch (error) {
            console.error("logout error", error)
        } finally {
            setIsLoggingOut(false)
        }
    }

    const handleLogoutSelect = (event: Event) => {
        event.preventDefault()
        handleLogout()
    }

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
                    <Link href="/tv-series">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <Tv className="h-4 w-4" />
                            TV Series
                        </Button>
                    </Link>
                    <Link href="/anime">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <Tv className="h-4 w-4" />
                            Anime
                        </Button>
                    </Link>
                    <Link href="/books">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <Book className="h-4 w-4" />
                            Books
                        </Button>
                    </Link>
                    <Link href="/manga">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <Book className="h-4 w-4" />
                            Manga
                        </Button>
                    </Link>
                    <Link href="/comics">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <Book className="h-4 w-4" />
                            Comics
                        </Button>
                    </Link>
                </div>

                <div className="hidden md:flex flex-1 max-w-md mx-4">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => onSearchQueryChange(e.target.value)}
                            className="w-full pl-9 bg-secondary/50 border-border/50 focus-visible:ring-primary"
                        />
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-2">
                    {sessionUser ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <User className="h-4 w-4" />
                                    <span className="max-w-[140px] truncate">{sessionUser.displayName}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem className="pointer-events-none opacity-70">
                                    Signed in as @{sessionUser.username}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onSelect={handleLogoutSelect}
                                    disabled={isLoggingOut}
                                    className="text-destructive focus:text-destructive"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button asChild variant="outline" size="sm">
                            <Link href="/login">Login</Link>
                        </Button>
                    )}
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
                                    Movies
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/tv-series" className="gap-2">
                                    <Tv className="h-4 w-4" />
                                    TV Series
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/anime" className="gap-2">
                                    <Tv className="h-4 w-4" />
                                    Anime
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/books" className="gap-2">
                                    <Book className="h-4 w-4" />
                                    Books
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/manga" className="gap-2">
                                    <Book className="h-4 w-4" />
                                    Manga
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/comics" className="gap-2">
                                    <Book className="h-4 w-4" />
                                    Comics
                                </Link>
                            </DropdownMenuItem>
                            {sessionUser ? (
                                <DropdownMenuItem
                                    onSelect={handleLogoutSelect}
                                    disabled={isLoggingOut}
                                    className="text-destructive focus:text-destructive"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem asChild>
                                    <Link href="/login" className="gap-2">
                                        <User className="h-4 w-4" />
                                        Login
                                    </Link>
                                </DropdownMenuItem>
                            )}
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
                            onChange={(e) => onSearchQueryChange(e.target.value)}
                            className="w-full pl-9 bg-secondary/50 border-border/50"
                        />
                    </div>
                </div>
        </nav>
    )
}

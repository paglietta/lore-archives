"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AuthForm() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: username.trim(),
                    password,
                }),
            });

            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(payload?.error ?? "Unable to sign in.");
            }

            router.replace("/");
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Unable to sign in.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="text-center text-xl">Sign in to Lore Archives</CardTitle>
            </CardHeader>
            <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground" htmlFor="username">
                            Username
                        </label>
                        <Input
                            id="username"
                            autoComplete="username"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground" htmlFor="password">
                            Password
                        </label>
                        <Input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />
                    </div>

                    {errorMessage ? (
                        <p className="text-sm text-destructive" role="alert">
                            {errorMessage}
                        </p>
                    ) : null}

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Signing in..." : "Sign in"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
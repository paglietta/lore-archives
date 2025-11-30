import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth";

export const metadata: Metadata = {
    title: "Dashboard | Lore Archives",
};

export default async function DashboardPage() {
    const user = await requireAuth();

    return (
        <section className="container max-w-5xl space-y-6 py-10">
            <div>
                <h1 className="text-3xl font-semibold text-foreground">
                    Welcome back, {user.displayName}
                </h1>
                <p className="text-muted-foreground">Signed in as @{user.username}</p>
            </div>

            <div className="rounded-lg border border-border/50 bg-card p-6">
                <p className="text-sm text-muted-foreground">
                    This dashboard section is only visible to authenticated users. Build your private content
                    here.
                </p>
            </div>
        </section>
    );
}
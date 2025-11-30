import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
    title: "Login | Lore Archives",
};

export default async function LoginPage() {
    const user = await getCurrentUser();

    if (user) {
        redirect("/");
    }

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
            <div className="w-full max-w-md">
                <AuthForm />
            </div>
        </div>
    );
}
"use server";

import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { readSessionToken, SESSION_COOKIE_NAME, type SessionUser } from "./session";

export type { SessionUser };

export async function getCurrentUser(req?: NextRequest): Promise<SessionUser | null> {
    if (req) {
        const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
        return readSessionToken(token);
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    return readSessionToken(token);
}

export async function requireAuth(): Promise<SessionUser> {
    const user = await getCurrentUser();
    if (!user) {
        redirect("/login");
    }
    return user;
}
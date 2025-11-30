import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { readSessionToken, SESSION_COOKIE_NAME } from "./lib/session";

export async function middleware(req: NextRequest) {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const user = await readSessionToken(token);

    if (!user) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*"],
};
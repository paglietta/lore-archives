import { NextRequest, NextResponse } from "next/server";
import { verifyAccountCredentials } from "@/lib/accounts";
import { clearSessionCookie, createSessionToken, setSessionCookie } from "@/lib/session";

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const username = typeof body.username === "string" ? body.username : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!username || !password) {
        return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
    }

    const account = verifyAccountCredentials(username, password);

    if (!account) {
        return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const token = await createSessionToken(account);
    const response = NextResponse.json({ user: account });
    setSessionCookie(response, token);
    return response;
}

export async function DELETE() {
    const response = NextResponse.json({ success: true });
    clearSessionCookie(response);
    return response;
}
import { NextResponse } from "next/server";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const SESSION_SECRET = process.env.SESSION_SECRET ?? "dev-insecure-session-secret";
if (!process.env.SESSION_SECRET) {
    console.warn("SESSION_SECRET is not set. Falling back to an insecure development secret.");
}

export const SESSION_COOKIE_NAME = "lore_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

let signingKeyPromise: Promise<CryptoKey> | null = null;

function getSubtleCrypto(): SubtleCrypto {
    const cryptoObj = globalThis.crypto;
    if (!cryptoObj?.subtle) {
        throw new Error("Web Crypto API is not available in this runtime.");
    }
    return cryptoObj.subtle;
}

async function getSigningKey(): Promise<CryptoKey> {
    if (!signingKeyPromise) {
        const subtle = getSubtleCrypto();
        signingKeyPromise = subtle.importKey(
            "raw",
            encoder.encode(SESSION_SECRET),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign", "verify"],
        );
    }
    return signingKeyPromise;
}

function base64UrlEncode(bytes: Uint8Array): string {
    let base64: string;

    if (typeof Buffer !== "undefined") {
        base64 = Buffer.from(bytes).toString("base64");
    } else {
        let binary = "";
        bytes.forEach((byte) => {
            binary += String.fromCharCode(byte);
        });
        base64 = btoa(binary);
    }

    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const remainder = normalized.length % 4;
    const padded = normalized + (remainder === 0 ? "" : "=".repeat(4 - remainder));

    if (typeof Buffer !== "undefined") {
        const decoded = Buffer.from(padded, "base64");
        return new Uint8Array(
            decoded.buffer.slice(decoded.byteOffset, decoded.byteOffset + decoded.byteLength),
        );
    }

    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

interface SessionPayload {
    sub: string;
    username: string;
    displayName: string;
    exp: number;
}

export interface SessionUser {
    id: string;
    username: string;
    displayName: string;
}

type SessionSubject = SessionUser;

export async function createSessionToken(subject: SessionSubject): Promise<string> {
    const payload: SessionPayload = {
        sub: subject.id,
        username: subject.username,
        displayName: subject.displayName,
        exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    };

    const payloadBytes = encoder.encode(JSON.stringify(payload));
    const encodedPayload = base64UrlEncode(payloadBytes);

    const subtle = getSubtleCrypto();
    const key = await getSigningKey();
    const signatureInput = encoder.encode(encodedPayload);
    const signatureBuffer = await subtle.sign("HMAC", key, signatureInput);
    const signature = base64UrlEncode(new Uint8Array(signatureBuffer));

    return `${encodedPayload}.${signature}`;
}

export async function readSessionToken(token?: string | null): Promise<SessionUser | null> {
    if (!token) {
        return null;
    }

    const [encodedPayload, signature] = token.split(".");
    if (!encodedPayload || !signature) {
        return null;
    }

    try {
        const subtle = getSubtleCrypto();
        const key = await getSigningKey();

        const signatureBytes = base64UrlDecode(signature);
        const verificationInput = encoder.encode(encodedPayload);
        const isValid = await subtle.verify(
            "HMAC",
            key,
            signatureBytes.buffer.slice(
                signatureBytes.byteOffset,
                signatureBytes.byteOffset + signatureBytes.byteLength
            ) as ArrayBuffer,
            verificationInput
        );

        if (!isValid) {
            return null;
        }

        const payloadBytes = base64UrlDecode(encodedPayload);
        const payload = JSON.parse(decoder.decode(payloadBytes)) as SessionPayload;

        if (payload.exp * 1000 < Date.now()) {
            return null;
        }

        return {
            id: payload.sub,
            username: payload.username,
            displayName: payload.displayName,
        };
    } catch {
        return null;
    }
}

export function setSessionCookie(res: NextResponse, token: string): void {
    res.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_TTL_SECONDS,
        path: "/",
    });
}

export function clearSessionCookie(res: NextResponse): void {
    res.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        expires: new Date(0),
        path: "/",
    });
}
import { betterFetch } from "@better-fetch/fetch";
import type { Session } from "better-auth/types";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const canonicalUrl = process.env.APP_URL_PROD;
    if (canonicalUrl) {
        try {
            const canonical = new URL(canonicalUrl);
            const canonicalIsLocalhost = canonical.hostname === "localhost" || canonical.hostname === "127.0.0.1";
            const isLocalhost = request.nextUrl.hostname === "localhost" || request.nextUrl.hostname === "127.0.0.1";
            if (!isLocalhost && !canonicalIsLocalhost && request.nextUrl.hostname !== canonical.hostname) {
                const redirectUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, canonical.origin);
                return NextResponse.redirect(redirectUrl, 307);
            }
        } catch {
            // ignore invalid APP_URL_PROD
        }
    }

    // 1. Session abrufen
    const { data: session } = await betterFetch<Session>(
        "/api/auth/get-session",
        {
            baseURL: request.nextUrl.origin,
            headers: {
                // Wichtig: Cookie mitsenden!
                cookie: request.headers.get("cookie") || "",
            },
        },
    );

    // 2. Pfad prüfen
    const isAuthPage = request.nextUrl.pathname.startsWith("/login");

    // 3. Weiterleitung Logik
    if (!session) {
        // Nicht eingeloggt -> Weg von geschützten Seiten, hin zum Login
        if (!isAuthPage) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    } else {
        // Bereits eingeloggt -> Weg von Login-Seite, hin zur App
        if (isAuthPage) {
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    return NextResponse.next();
}

// Auf welche Pfade soll die Middleware angewendet werden?
export const config = {
    matcher: [
        // Alle Pfade außer statische Dateien und API-Routen (außer auth check selbst)
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
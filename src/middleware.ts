import { betterFetch } from "@better-fetch/fetch";
import type { Session } from "better-auth/types";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
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
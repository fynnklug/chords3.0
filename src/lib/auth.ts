import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db"; // Pfad ggf. anpassen, falls db/index.ts woanders liegt
import { user, session, account, verification } from "./db/schema"; // Importiere DEINE Tabellen

const trustedOrigins = (process.env.BETTER_AUTH_TRUSTED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin): origin is string => Boolean(origin));

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    trustedOrigins,
    database: drizzleAdapter(db, {
        provider: "pg", // oder "sqlite", "mysql" je nach DB
        schema: {
            // Wir mappen die better-auth Namen auf unsere exportierten Tabellen
            user,
            session,
            account,
            verification,
        },
    }),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
    },
});
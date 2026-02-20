import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db"; // Pfad ggf. anpassen, falls db/index.ts woanders liegt
import { user, session, account, verification } from "./db/schema"; // Importiere DEINE Tabellen

const trustedOrigins = [process.env.APP_URL_DEV, process.env.APP_URL_PROD]
    .map((origin) => origin?.trim())
    .filter((origin): origin is string => Boolean(origin));

export const auth = betterAuth({
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
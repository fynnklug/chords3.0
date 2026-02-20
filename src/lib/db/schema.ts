import { pgTable, text, timestamp, integer, boolean, primaryKey } from "drizzle-orm/pg-core";

// --- Better Auth Tabellen ---

export const user = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("emailVerified").notNull(),
    image: text("image"),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
});

export const session = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expiresAt").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    userId: text("userId").notNull().references(() => user.id),
});

export const account = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    userId: text("userId").notNull().references(() => user.id),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
});

export const verification = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt"),
    updatedAt: timestamp("updatedAt"),
});

// --- Deine App Tabellen (Lieder, Playlists...) ---

// Hinweis: Ich nutze hier serial für IDs, damit es einfach bleibt.
// Die Verknüpfung zum User (userId) ist Text, weil better-auth Text-IDs nutzt.

export const lieder = pgTable("lied", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    artist: text("artist"),
    category: text("category"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const playlists = pgTable("playlist", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: text("name").notNull(),
    userId: text("userId").notNull().references(() => user.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const playlistLieder = pgTable("playlist_lied", {
    playlistId: integer("playlistId").notNull().references(() => playlists.id),
    liedId: integer("liedId").notNull().references(() => lieder.id),
    addedAt: timestamp("addedAt").defaultNow().notNull(),
}, (t) => [
    primaryKey({ columns: [t.playlistId, t.liedId] })
]);

export const history = pgTable("history", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: text("userId").notNull().references(() => user.id),
    liedId: integer("liedId").notNull().references(() => lieder.id),
    sungAt: timestamp("sungAt").defaultNow().notNull(),
});

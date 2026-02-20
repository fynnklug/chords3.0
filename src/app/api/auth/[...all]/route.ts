import { auth } from "@/lib/auth"; // Pfad zu deiner auth.ts anpassen
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
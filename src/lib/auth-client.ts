import { createAuthClient } from "better-auth/react";

const getBaseURL = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return process.env.NODE_ENV === "production"
    ? process.env.APP_URL_PROD || ""
    : process.env.APP_URL_DEV || "";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
});

export const { signIn, signOut, useSession } = authClient;

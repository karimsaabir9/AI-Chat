import { createAuthClient } from "better-auth/react";

// No baseURL: defaults to the current origin, so this works both in local
// dev and in production without hardcoding a host.
export const authClient = createAuthClient({});

export const { useSession, signIn, signOut, signUp } = authClient;


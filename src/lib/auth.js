import { cookies } from "next/headers";
import { getUserById } from "./db";

const COOKIE_NAME = "docedit_session";

// This is a mocked, single-tenant auth scheme intended for demo purposes only:
// "logging in" just picks a seeded user and stores their id in a cookie.
// There is no password, no hashing, no session expiry logic. This tradeoff is
// documented in ARCHITECTURE.md.
export async function getCurrentUser() {
  const store = await cookies();
  const id = store.get(COOKIE_NAME)?.value;
  if (!id) return null;
  return (await getUserById(id)) || null;
}

export async function setCurrentUser(userId) {
  const store = await cookies();
  store.set(COOKIE_NAME, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearCurrentUser() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

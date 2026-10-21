"use client";

import { createContext, use } from "react";

const UserContext = createContext(null);

// The session promise can be created inside the shell's Suspense boundary.
export function UserProvider({ userPromise, children }) {
  return <UserContext value={userPromise}>{children}</UserContext>;
}

export function useUser() {
  // Fail clearly outside the provider and suspend while the shared promise resolves.
  const userPromise = use(UserContext);
  if (!userPromise) throw new Error("useUser must be used inside UserProvider");
  return use(userPromise);
}

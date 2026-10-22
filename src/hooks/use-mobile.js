"use client";

import { useSyncExternalStore } from "react";

// Keep this query aligned with Tailwind's `md` breakpoint so JavaScript and CSS
// agree about when the permanent sidebar should become an off-canvas drawer.
const MOBILE_MEDIA_QUERY = "(max-width: 767px)";

function subscribeToViewportChange(onStoreChange) {
  const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
  mediaQuery.addEventListener("change", onStoreChange);

  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getMobileSnapshot() {
  return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
}

// Server rendering starts with the desktop value; React updates it immediately
// after hydration without requiring an effect-driven state synchronization.
function getServerSnapshot() {
  return false;
}

export function useIsMobile() {
  return useSyncExternalStore(subscribeToViewportChange, getMobileSnapshot, getServerSnapshot);
}

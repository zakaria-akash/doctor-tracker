"use client";

import { useEffect, useState } from "react";

// Debounce the value used in the query key, not only nuqs' URL writes.
export function useDebouncedValue(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    // Replace pending updates as the user types and clean up when this hook unmounts.
    const timeout = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);
  return debounced;
}

"use client";

import { isServer, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Keep fetched data briefly fresh and limit retries to likely transient failures.
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // Validation/auth errors cannot succeed on retry; retry temporary server failures only.
        retry: (count, error) => (error?.status == null || error.status >= 500) && count < 2,
      },
    },
  });
}

let browserQueryClient;
function getQueryClient() {
  // Isolate server renders, but retain one browser cache across client navigations and Suspense.
  if (isServer) return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

// The devtools are available only during local development.
export function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={getQueryClient()}>
      {children}
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

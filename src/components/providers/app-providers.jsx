"use client";

import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Tooltip } from "radix-ui";
import { Toaster } from "sonner";
import { QueryProvider } from "./query-provider";

// Keep shared UI providers together while keeping user/session data on the server.
export function AppProviders({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryProvider>
        <NuqsAdapter>
          <Tooltip.Provider delayDuration={200}>
            {children}
            <Toaster richColors closeButton position="top-right" />
          </Tooltip.Provider>
        </NuqsAdapter>
      </QueryProvider>
    </ThemeProvider>
  );
}

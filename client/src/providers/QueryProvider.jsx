"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

/**
 * Next.js App Router recommended QueryClient initialization:
 * Using useState ensures the QueryClient is created once per client session
 * and not recreated on component re-renders or shared across requests.
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 1 minute (prevents immediate redundant refetches)
        staleTime: 60 * 1000,
        // Unused data remains in cache for 10 minutes before garbage collection
        gcTime: 10 * 60 * 1000,
        // Auto-refetch when user focuses back on the browser tab (critical for multi-tab sync)
        refetchOnWindowFocus: true,
        // Refetch when browser regains network connection
        refetchOnReconnect: true,
        // Retry failed queries once before showing error
        retry: 1,
      },
      mutations: {
        // Retry mutations 0 times to avoid duplicate writes (create/update/delete)
        retry: 0,
      },
    },
  });
}

export default function QueryProvider({ children }) {
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* TanStack Query Devtools: automatically omitted in production builds */}
      {process.env.NODE_ENV !== "production" && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  );
}


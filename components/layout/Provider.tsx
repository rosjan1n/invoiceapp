"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { InvoiceContextProvider } from "@/contexts/invoiceContext";

function Provider({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minut
        gcTime: 10 * 60 * 1000, // 10 minut (dawniej cacheTime)
        retry: (failureCount, error) => {
          // Nie retry dla błędów 4xx
          if (error instanceof Error && "status" in error) {
            const status = (error as any).status;
            if (status >= 400 && status < 500) return false;
          }
          return failureCount < 3;
        },
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <InvoiceContextProvider>{children}</InvoiceContextProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}

export default Provider;

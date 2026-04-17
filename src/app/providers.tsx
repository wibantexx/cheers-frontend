"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { useState } from "react";
import ThemeProvider from "@/components/ThemeProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: "var(--font-dm)",
            background: "var(--ink)",
            color: "#FAF5EF",
            borderRadius: "12px",
            padding: "12px 18px",
          },
        }}
      />
    </QueryClientProvider>
  );
}

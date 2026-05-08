import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { queryClient } from "../lib/query-client";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    // QueryClientProvider подключает TanStack Query ко всему React-приложению.
    // Благодаря этому любые страницы и компоненты смогут использовать useQuery/useMutation.
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

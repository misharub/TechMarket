import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { AuthBootstrap } from "../components/auth/AuthBootstrap";
import { CartBootstrap } from "../components/cart/CartBootstrap";
import { queryClient } from "../lib/query-client";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap />
      <CartBootstrap />
      {children}
    </QueryClientProvider>
  );
}

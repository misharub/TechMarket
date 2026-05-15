import { useEffect } from "react";
import { useAuthStore } from "../../lib/auth-store";

export function AuthBootstrap() {
  const bootstrap = useAuthStore((state) => state.bootstrap);
  const isBootstrapped = useAuthStore((state) => state.isBootstrapped);

  useEffect(() => {
    if (!isBootstrapped) {
      void bootstrap();
    }
  }, [bootstrap, isBootstrapped]);

  return null;
}

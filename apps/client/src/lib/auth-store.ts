import { create } from "zustand";
import { login, logout, refreshAuth, type AuthUser, type LoginPayload } from "./auth-api";
import { setApiAccessToken } from "./api";

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  isBootstrapped: boolean;
  bootstrap: () => Promise<void>;
  signIn: (payload: LoginPayload) => Promise<AuthUser>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isBootstrapped: false,
  async bootstrap() {
    try {
      const result = await refreshAuth();
      setApiAccessToken(result.accessToken);
      set({ user: result.user, accessToken: result.accessToken, isBootstrapped: true });
    } catch {
      setApiAccessToken(null);
      set({ user: null, accessToken: null, isBootstrapped: true });
    }
  },
  async signIn(payload) {
    const result = await login(payload);
    setApiAccessToken(result.accessToken);
    set({ user: result.user, accessToken: result.accessToken, isBootstrapped: true });
    return result.user;
  },
  async signOut() {
    await logout();
    setApiAccessToken(null);
    set({ user: null, accessToken: null, isBootstrapped: true });
  },
}));

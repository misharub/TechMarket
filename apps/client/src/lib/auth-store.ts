import { create } from "zustand";
import {
  login,
  logout,
  refreshAuth,
  register,
  type AuthUser,
  type LoginPayload,
  type RegisterPayload,
} from "./auth-api";
import { setApiAccessToken } from "./api";

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  isBootstrapped: boolean;
  bootstrap: () => Promise<void>;
  signIn: (payload: LoginPayload) => Promise<AuthUser>;
  signUp: (payload: RegisterPayload) => Promise<AuthUser>;
  setUser: (user: AuthUser) => void;
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
  async signUp(payload) {
    const result = await register(payload);
    setApiAccessToken(result.accessToken);
    set({ user: result.user, accessToken: result.accessToken, isBootstrapped: true });
    return result.user;
  },
  setUser(user) {
    set((state) => ({ ...state, user }));
  },
  async signOut() {
    await logout();
    setApiAccessToken(null);
    set({ user: null, accessToken: null, isBootstrapped: true });
  },
}));

import { apiGet, apiPost } from "./api";

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  role: "USER" | "ADMIN";
  isBlocked: boolean;
  createdAt: string;
};

export type AuthResult = {
  accessToken: string;
  user: AuthUser;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export function login(payload: LoginPayload) {
  return apiPost<AuthResult, LoginPayload>("/auth/login", payload);
}

export function register(payload: RegisterPayload) {
  return apiPost<AuthResult, RegisterPayload>("/auth/register", payload);
}

export function refreshAuth() {
  return apiPost<AuthResult>("/auth/refresh");
}

export function logout() {
  return apiPost<{ success: true }>("/auth/logout");
}

export function getCurrentUser() {
  return apiGet<AuthUser>("/auth/me");
}

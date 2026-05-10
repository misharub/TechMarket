const defaultApiUrl = "http://localhost:5000/api";

export const apiBaseUrl = (import.meta.env.VITE_API_URL ?? defaultApiUrl).replace(/\/+$/, "");

export async function apiGet<TResponse>(path: string): Promise<TResponse> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const response = await fetch(`${apiBaseUrl}${normalizedPath}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<TResponse>;
}

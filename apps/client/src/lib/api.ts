const defaultApiUrl = "http://localhost:5000/api";

export const apiBaseUrl = (import.meta.env.VITE_API_URL ?? defaultApiUrl).replace(/\/+$/, "");

let accessToken: string | null = null;

export function setApiAccessToken(token: string | null) {
  accessToken = token;
}

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

async function apiRequest<TResponse>(path: string, options: ApiRequestOptions = {}): Promise<TResponse> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}${normalizedPath}`, {
      ...options,
      credentials: "include",
      headers: {
        ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...options.headers,
      },
      body:
        options.body === undefined
          ? undefined
          : options.body instanceof FormData
            ? options.body
            : JSON.stringify(options.body),
    });
  } catch {
    throw new Error("Не удалось подключиться к серверу. Проверьте, что backend запущен.");
  }

  if (!response.ok) {
    let message = `Ошибка запроса: ${response.status} ${response.statusText || "сервер вернул ошибку"}`;

    try {
      const payload = (await response.json()) as { message?: string | string[] };
      const nextMessage = Array.isArray(payload.message) ? payload.message.join(", ") : payload.message;

      if (nextMessage) {
        message = nextMessage;
      }
    } catch {
      // Ignore malformed error bodies.
    }

    throw new Error(message);
  }

  return response.json() as Promise<TResponse>;
}

export function apiGet<TResponse>(path: string) {
  return apiRequest<TResponse>(path);
}

export function apiPost<TResponse, TBody = unknown>(path: string, body?: TBody) {
  return apiRequest<TResponse>(path, { method: "POST", body });
}

export function apiPut<TResponse, TBody = unknown>(path: string, body: TBody) {
  return apiRequest<TResponse>(path, { method: "PUT", body });
}

export function apiPatch<TResponse, TBody = unknown>(path: string, body: TBody) {
  return apiRequest<TResponse>(path, { method: "PATCH", body });
}

export function apiDelete<TResponse>(path: string) {
  return apiRequest<TResponse>(path, { method: "DELETE" });
}

export function apiUpload<TResponse>(path: string, body: FormData) {
  return apiRequest<TResponse>(path, { method: "POST", body });
}

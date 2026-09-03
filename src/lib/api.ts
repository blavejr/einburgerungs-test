import type { AppStore } from "@/types";

const TOKEN_KEY = "ebt-auth-v1";
const DEFAULT_PROD_API = "https://einburgerungs-api.onrender.com";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function apiBase(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (import.meta.env.PROD) return DEFAULT_PROD_API;
  return "";
}

export function isApiConfigured(): boolean {
  return Boolean(apiBase()) || import.meta.env.DEV;
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* private mode */
  }
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiError(`Serverfehler (${response.status})`, response.status);
  }
}

export async function api<T>(path: string, init: RequestInit = {}, retried = false): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${apiBase()}${path}`, {
      ...init,
      headers,
      credentials: "include",
    });
  } catch {
    if (!retried) return api<T>(path, init, true);
    throw new ApiError("Server nicht erreichbar. Free-Tier braucht oft 30 Sekunden – nochmal versuchen.", 0);
  }

  const body = await parseBody(response);
  if (!response.ok) {
    if (response.status === 401) setToken(null);
    const message =
      body && typeof body === "object" && "error" in body && typeof body.error === "string"
        ? body.error
        : `Fehler (${response.status})`;
    throw new ApiError(message, response.status);
  }
  return body as T;
}

export function fetchMe() {
  return api<{ user: AuthUser }>("/api/auth/me");
}

export function loginRequest(email: string, password: string) {
  return api<{ user: AuthUser; token: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function registerRequest(name: string, email: string, password: string) {
  return api<{ user: AuthUser; token: string }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export function logoutRequest() {
  return api<{ ok: boolean }>("/api/auth/logout", { method: "POST" });
}

export function getProgressRequest() {
  return api<{ store: AppStore | null; updatedAt: string | null }>("/api/progress");
}

export function putProgressRequest(store: AppStore) {
  return api<{ store: AppStore; updatedAt: string }>("/api/progress", {
    method: "PUT",
    body: JSON.stringify({ store }),
  });
}

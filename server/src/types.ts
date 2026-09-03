import type { Request } from "express";

export interface PublicUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthBody {
  name?: unknown;
  email?: unknown;
  password?: unknown;
}

export interface ProgressStore {
  p: Record<string, unknown>;
  v: Record<string, unknown>;
  days: Record<string, unknown>;
  tests: unknown[];
  cfg: Record<string, unknown>;
}

export interface ProgressBody {
  store?: unknown;
}

export interface AuthedRequest extends Request {
  userId: string;
}

export interface TokenPayload {
  sub: string;
}

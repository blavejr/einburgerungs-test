import type { CookieOptions, NextFunction, Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";
import type { Env } from "./env.js";
import type { AuthedRequest, PublicUser, TokenPayload } from "./types.js";
import type { UserDoc } from "./models.js";

export const COOKIE = "ebt_token";
export const TOKEN_DAYS = 90;

export function cookieOptions(env: Env): CookieOptions {
  return {
    httpOnly: true,
    secure: env.production,
    sameSite: env.production ? "none" : "lax",
    maxAge: TOKEN_DAYS * 24 * 60 * 60 * 1000,
    path: "/",
  };
}

export function signToken(userId: string, secret: string): string {
  return jwt.sign({ sub: userId }, secret, { expiresIn: `${TOKEN_DAYS}d` });
}

export function publicUser(user: Pick<UserDoc, "name" | "email"> & { _id: { toString(): string } }): PublicUser {
  return { id: String(user._id), name: user.name, email: user.email };
}

function readToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  const cookie = req.cookies?.[COOKIE];
  return typeof cookie === "string" && cookie ? cookie : null;
}

function isTokenPayload(value: unknown): value is TokenPayload {
  return typeof value === "object" && value !== null && typeof (value as TokenPayload).sub === "string";
}

export function requireUser(env: Env): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = readToken(req);
    if (!token) {
      res.status(401).json({ error: "Nicht angemeldet" });
      return;
    }
    try {
      const payload: unknown = jwt.verify(token, env.jwtSecret);
      if (!isTokenPayload(payload)) {
        res.status(401).json({ error: "Sitzung abgelaufen" });
        return;
      }
      (req as AuthedRequest).userId = payload.sub;
      next();
    } catch {
      res.status(401).json({ error: "Sitzung abgelaufen" });
    }
  };
}

export function withUser(handler: (req: AuthedRequest, res: Response) => Promise<void> | void): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req as AuthedRequest, res)).catch(next);
  };
}

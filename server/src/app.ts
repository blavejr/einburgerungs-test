import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { COOKIE, cookieOptions, publicUser, requireUser, signToken, withUser } from "./auth.js";
import type { Env } from "./env.js";
import { Progress, User } from "./models.js";
import { isStore, storeFromDoc } from "./store.js";
import type { AuthBody, ProgressBody } from "./types.js";

function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function createApp(env: Env) {
  const app = express();
  app.set("trust proxy", 1);
  app.use(cors({ origin: env.origins, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  app.get("/health", (_req, res) => {
    const ready = mongoose.connection.readyState === 1;
    res.status(ready ? 200 : 503).json({ ok: ready, db: env.databaseName });
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const body = req.body as AuthBody;
      const name = readString(body.name).trim();
      const email = readString(body.email).trim().toLowerCase();
      const password = readString(body.password);
      if (name.length < 1 || name.length > 60) {
        res.status(400).json({ error: "Name fehlt" });
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        res.status(400).json({ error: "E-Mail ist ungültig" });
        return;
      }
      if (password.length < 8) {
        res.status(400).json({ error: "Passwort mindestens 8 Zeichen" });
        return;
      }
      const existing = await User.findOne({ email }).lean();
      if (existing) {
        res.status(409).json({ error: "Diese E-Mail ist schon registriert" });
        return;
      }
      const user = await User.create({
        name,
        email,
        passwordHash: await bcrypt.hash(password, 10),
      });
      const token = signToken(String(user._id), env.jwtSecret);
      res.cookie(COOKIE, token, cookieOptions(env));
      res.status(201).json({ user: publicUser(user), token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Registrierung fehlgeschlagen" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const body = req.body as AuthBody;
      const email = readString(body.email).trim().toLowerCase();
      const password = readString(body.password);
      const user = await User.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        res.status(401).json({ error: "E-Mail oder Passwort stimmt nicht" });
        return;
      }
      const token = signToken(String(user._id), env.jwtSecret);
      res.cookie(COOKIE, token, cookieOptions(env));
      res.json({ user: publicUser(user), token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Anmeldung fehlgeschlagen" });
    }
  });

  app.post("/api/auth/logout", (_req, res) => {
    res.clearCookie(COOKIE, cookieOptions(env));
    res.json({ ok: true });
  });

  app.get(
    "/api/auth/me",
    requireUser(env),
    withUser(async (req, res) => {
      const user = await User.findById(req.userId).lean();
      if (!user) {
        res.status(401).json({ error: "Konto nicht gefunden" });
        return;
      }
      res.json({ user: publicUser(user) });
    }),
  );

  app.get(
    "/api/progress",
    requireUser(env),
    withUser(async (req, res) => {
      const doc = await Progress.findOne({ userId: req.userId }).lean();
      res.json({
        store: storeFromDoc(doc),
        updatedAt: doc?.updatedAt?.toISOString() ?? null,
      });
    }),
  );

  app.put(
    "/api/progress",
    requireUser(env),
    withUser(async (req, res) => {
      const store = (req.body as ProgressBody).store;
      if (!isStore(store)) {
        res.status(400).json({ error: "Ungültiger Fortschritt" });
        return;
      }
      const doc = await Progress.findOneAndUpdate(
        { userId: req.userId },
        {
          $set: {
            p: store.p ?? {},
            v: store.v ?? {},
            days: store.days ?? {},
            tests: Array.isArray(store.tests) ? store.tests : [],
            cfg: store.cfg ?? {},
          },
        },
        { upsert: true, new: true },
      );
      if (!doc) {
        res.status(500).json({ error: "Fortschritt nicht gespeichert" });
        return;
      }
      res.json({ store: storeFromDoc(doc), updatedAt: doc.updatedAt.toISOString() });
    }),
  );

  app.use((_req, res) => {
    res.status(404).json({ error: "Nicht gefunden" });
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: "Serverfehler" });
  });

  return app;
}

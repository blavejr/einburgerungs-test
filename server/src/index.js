import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Progress, User } from "./models.js";

const PORT = Number(process.env.PORT) || 8787;
const DATABASE_URI = process.env.DATABASE_URI;
const DATABASE_NAME = process.env.DATABASE_NAME || "einburgerung";
const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE = "ebt_token";
const TOKEN_DAYS = 90;

const origins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

if (!DATABASE_URI || !JWT_SECRET) {
  console.error("DATABASE_URI and JWT_SECRET are required");
  process.exit(1);
}

const app = express();
app.set("trust proxy", 1);
app.use(
  cors({
    origin: origins,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

function cookieOptions() {
  const prod = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: prod,
    sameSite: prod ? "none" : "lax",
    maxAge: TOKEN_DAYS * 24 * 60 * 60 * 1000,
    path: "/",
  };
}

function signToken(userId) {
  return jwt.sign({ sub: String(userId) }, JWT_SECRET, { expiresIn: `${TOKEN_DAYS}d` });
}

function publicUser(user) {
  return { id: String(user._id), name: user.name, email: user.email };
}

function readToken(req) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return req.cookies?.[COOKIE] || null;
}

function requireUser(req, res, next) {
  const token = readToken(req);
  if (!token) {
    res.status(401).json({ error: "Nicht angemeldet" });
    return;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: "Sitzung abgelaufen" });
  }
}

function isStore(value) {
  return typeof value === "object" && value !== null && typeof value.p === "object" && value.p !== null;
}

function storeFromDoc(doc) {
  if (!doc) return null;
  return {
    p: doc.p ?? {},
    v: doc.v ?? {},
    days: doc.days ?? {},
    tests: doc.tests ?? [],
    cfg: doc.cfg ?? {},
  };
}

app.get("/health", (_req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ ok: ready, db: DATABASE_NAME });
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
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
    const token = signToken(user._id);
    res.cookie(COOKIE, token, cookieOptions());
    res.status(201).json({ user: publicUser(user), token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Registrierung fehlgeschlagen" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ error: "E-Mail oder Passwort stimmt nicht" });
      return;
    }
    const token = signToken(user._id);
    res.cookie(COOKIE, token, cookieOptions());
    res.json({ user: publicUser(user), token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Anmeldung fehlgeschlagen" });
  }
});

app.post("/api/auth/logout", (_req, res) => {
  res.clearCookie(COOKIE, cookieOptions());
  res.json({ ok: true });
});

app.get("/api/auth/me", requireUser, async (req, res) => {
  const user = await User.findById(req.userId).lean();
  if (!user) {
    res.status(401).json({ error: "Konto nicht gefunden" });
    return;
  }
  res.json({ user: publicUser(user) });
});

app.get("/api/progress", requireUser, async (req, res) => {
  const doc = await Progress.findOne({ userId: req.userId }).lean();
  res.json({
    store: storeFromDoc(doc),
    updatedAt: doc?.updatedAt ?? null,
  });
});

app.put("/api/progress", requireUser, async (req, res) => {
  const store = req.body?.store;
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
  res.json({ store: storeFromDoc(doc), updatedAt: doc.updatedAt });
});

app.use((_req, res) => {
  res.status(404).json({ error: "Nicht gefunden" });
});

try {
  await mongoose.connect(DATABASE_URI, { dbName: DATABASE_NAME });
  console.log(`Mongo connected (db=${DATABASE_NAME})`);
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`API listening on ${PORT}`);
  });
} catch (error) {
  console.error("Mongo connection failed", error);
  process.exit(1);
}

import { DEFAULT_EXAM, DEFAULT_GOAL, STORAGE_KEY } from "@/data/constants";
import type { AppStore } from "@/types";

const memory: { store?: AppStore } = {};

export function createEmptyStore(): AppStore {
  return {
    p: {},
    v: {},
    days: {},
    tests: [],
    cfg: { exam: DEFAULT_EXAM, goal: DEFAULT_GOAL, en: true },
  };
}

export function normalizeStore(raw: AppStore): AppStore {
  return {
    p: raw.p ?? {},
    v: raw.v ?? {},
    days: raw.days ?? {},
    tests: raw.tests ?? [],
    cfg: {
      exam: raw.cfg?.exam || DEFAULT_EXAM,
      goal: raw.cfg?.goal || DEFAULT_GOAL,
      en: raw.cfg?.en !== false,
    },
  };
}

export function loadStore(): AppStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyStore();
    return normalizeStore(JSON.parse(raw) as AppStore);
  } catch {
    return memory.store ?? createEmptyStore();
  }
}

export function saveStore(store: AppStore): boolean {
  memory.store = store;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    return true;
  } catch {
    return false;
  }
}

export function isAppStore(value: unknown): value is AppStore {
  return typeof value === "object" && value !== null && "p" in value && typeof value.p === "object";
}

export function hasProgressData(store: AppStore): boolean {
  return (
    Object.keys(store.p).length > 0 ||
    Object.keys(store.v).length > 0 ||
    store.tests.length > 0 ||
    Object.keys(store.days).length > 0
  );
}

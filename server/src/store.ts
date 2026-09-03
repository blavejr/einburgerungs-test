import type { ProgressDoc } from "./models.js";
import type { ProgressStore } from "./types.js";

export function isStore(value: unknown): value is ProgressStore {
  return typeof value === "object" && value !== null && typeof (value as ProgressStore).p === "object" && (value as ProgressStore).p !== null;
}

export function storeFromDoc(doc: ProgressDoc | null | undefined): ProgressStore | null {
  if (!doc) return null;
  return {
    p: doc.p ?? {},
    v: doc.v ?? {},
    days: doc.days ?? {},
    tests: doc.tests ?? [],
    cfg: doc.cfg ?? {},
  };
}

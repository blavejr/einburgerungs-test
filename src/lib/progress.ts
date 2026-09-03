import { DAY_MS, INTERVALS } from "@/data/constants";
import { todayKey } from "@/lib/dates";
import type { AppStore, ProgressRecord } from "@/types";

export function emptyRecord(): ProgressRecord {
  return { box: 0, last: null, at: 0, due: 0, seen: 0, ok: 0, ko: 0 };
}

export function getRecord(store: AppStore, id: number): ProgressRecord | undefined {
  return store.p[id];
}

export function recordOrEmpty(store: AppStore, id: number): ProgressRecord {
  return store.p[id] ?? emptyRecord();
}

export function isDue(store: AppStore, id: number, now = Date.now()): boolean {
  const record = store.p[id];
  return Boolean(record && record.seen > 0 && record.due <= now);
}

export function isNew(store: AppStore, id: number): boolean {
  const record = store.p[id];
  return !record || record.seen === 0;
}

export function nextRecord(prev: ProgressRecord, correct: boolean, now = Date.now()): ProgressRecord {
  const box = correct ? Math.min(5, prev.box + 1) : 0;
  return {
    ...prev,
    seen: prev.seen + 1,
    at: now,
    last: correct ? "r" : "w",
    ok: prev.ok + (correct ? 1 : 0),
    ko: prev.ko + (correct ? 0 : 1),
    box,
    due: now + INTERVALS[box] * DAY_MS,
  };
}

export function applyMark(store: AppStore, id: number, correct: boolean, now = Date.now()): AppStore {
  const next = nextRecord(recordOrEmpty(store, id), correct, now);
  const day = todayKey();
  const dayPrev = store.days[day] ?? { n: 0, ok: 0 };

  return {
    ...store,
    p: { ...store.p, [id]: next },
    days: {
      ...store.days,
      [day]: { n: dayPrev.n + 1, ok: dayPrev.ok + (correct ? 1 : 0) },
    },
  };
}

export function vocabRecord(store: AppStore, id: string): ProgressRecord {
  return store.v[id] ?? emptyRecord();
}

export function isVocabDue(store: AppStore, id: string, now = Date.now()): boolean {
  const record = store.v[id];
  return Boolean(record && record.seen > 0 && record.due <= now);
}

export function isVocabNew(store: AppStore, id: string): boolean {
  const record = store.v[id];
  return !record || record.seen === 0;
}

export function applyVocabMark(store: AppStore, id: string, correct: boolean, now = Date.now()): AppStore {
  return {
    ...store,
    v: { ...store.v, [id]: nextRecord(vocabRecord(store, id), correct, now) },
  };
}

export function previewBox(store: AppStore, id: number, correct: boolean): number {
  const prev = recordOrEmpty(store, id);
  return correct ? Math.min(5, prev.box + 1) : 0;
}

export function currentStreak(days: AppStore["days"]): number {
  let n = 0;
  const cursor = new Date();
  if (!days[todayKey()]) cursor.setDate(cursor.getDate() - 1);

  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (days[key]?.n > 0) {
      n += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return n;
}

export function dotClass(store: AppStore, id: number, now = Date.now()): string {
  const record = store.p[id];
  if (!record || !record.seen) return "";

  let cls = record.last === "w" ? "w" : `r${Math.max(1, record.box)}`;
  if (record.last === "w" && now - record.at > 3 * DAY_MS) cls += " old";
  if (new Date(record.at).toISOString().slice(0, 10) === todayKey()) cls += " today";
  return cls;
}

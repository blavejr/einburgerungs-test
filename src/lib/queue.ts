import { CATEGORIES } from "@/data/categories";
import { QUESTIONS, QUESTIONS_BY_ID } from "@/data/questions";
import { isDue, isNew, recordOrEmpty } from "@/lib/progress";
import { shuffle } from "@/lib/shuffle";
import type { AppStore, CardsOptions, LearnOptions, Question } from "@/types";

export function interleave(ids: number[], byId: Record<number, Question> = QUESTIONS_BY_ID): number[] {
  const buckets: Record<string, number[]> = {};
  for (const id of shuffle(ids)) {
    const category = byId[id].c;
    (buckets[category] ??= []).push(id);
  }

  const keys = Object.keys(buckets);
  const out: number[] = [];
  let any = true;
  while (any) {
    any = false;
    for (const key of keys) {
      const next = buckets[key].shift();
      if (next !== undefined) {
        out.push(next);
        any = true;
      }
    }
  }
  return out;
}

export function smartQueue(ids: number[], store: AppStore, n: number): number[] {
  const due = shuffle(ids.filter((id) => isDue(store, id))).sort(
    (a, b) => recordOrEmpty(store, a).box - recordOrEmpty(store, b).box,
  );
  const wrong = shuffle(ids.filter((id) => !isDue(store, id) && store.p[id]?.last === "w"));
  const fresh = interleave(ids.filter((id) => isNew(store, id)));
  const rest = shuffle(
    ids.filter((id) => !isDue(store, id) && !isNew(store, id) && store.p[id]?.last !== "w"),
  ).sort((a, b) => recordOrEmpty(store, a).box - recordOrEmpty(store, b).box);

  const seen = new Set<number>();
  const out: number[] = [];
  for (const id of [...due, ...wrong, ...fresh, ...rest]) {
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
    if (out.length >= n) break;
  }
  return out;
}

export function pickLearnIds(store: AppStore, options: LearnOptions): number[] {
  if (options.mode === "single") return options.ids ?? [];

  let ids = QUESTIONS.map((q) => q.i);
  if (options.mode === "cat" && options.cat) {
    ids = ids.filter((id) => QUESTIONS_BY_ID[id].c === options.cat);
  }

  const n = options.n ?? 999;
  if (options.mode === "wrong") {
    return shuffle(ids.filter((id) => store.p[id]?.last === "w")).slice(0, n);
  }
  if (options.mode === "new") {
    return interleave(ids.filter((id) => isNew(store, id))).slice(0, n);
  }
  if (options.mode === "all") return ids.slice(0, n);
  if (options.mode === "random") return shuffle(ids).slice(0, n);
  return smartQueue(ids, store, n);
}

export function pickCardIds(store: AppStore, options: CardsOptions): number[] {
  let ids = QUESTIONS.map((q) => q.i);
  if (options.cat) ids = ids.filter((id) => QUESTIONS_BY_ID[id].c === options.cat);

  const n = options.n ?? 999;
  const mode = options.mode ?? "smart";
  if (mode === "wrong") ids = shuffle(ids.filter((id) => store.p[id]?.last === "w"));
  else if (mode === "new") ids = interleave(ids.filter((id) => isNew(store, id)));
  else if (mode === "random") ids = shuffle(ids);
  else ids = smartQueue(ids, store, n);

  return ids.slice(0, n);
}

export function learnTitle(options: LearnOptions): string {
  if (options.mode === "cat" && options.cat) return CATEGORIES[options.cat].de;
  return {
    smart: "Empfohlen",
    wrong: "Meine Fehler",
    new: "Neue Fragen",
    all: "Der Reihe nach",
    random: "Zufällig",
    single: "Eine Frage",
    cat: "Thema",
  }[options.mode];
}

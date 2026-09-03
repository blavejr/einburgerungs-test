import { QUESTIONS_BY_ID } from "@/data/questions";
import { VOCABULARY, VOCAB_BY_ID } from "@/data/vocabulary";
import { isVocabDue, isVocabNew, vocabRecord } from "@/lib/progress";
import { shuffle } from "@/lib/shuffle";
import type { AppStore, VocabEntry, VocabOptions, VocabQuizChoice } from "@/types";

export function vocabNeedle(entry: VocabEntry): string {
  return entry.form || entry.word.replace(/^(der|die|das)\s+/i, "");
}

export function vocabExample(entry: VocabEntry): { de: string; en: string } {
  const question = QUESTIONS_BY_ID[entry.q];
  const needle = vocabNeedle(entry).toLowerCase();
  const candidates = [
    { de: question.q, en: question.eq },
    { de: question.a[question.k], en: question.ea[question.k] },
    ...question.a.map((answer, index) => ({ de: answer, en: question.ea[index] })),
  ];
  return candidates.find((item) => item.de.toLowerCase().includes(needle)) ?? { de: question.q, en: question.eq };
}

export function highlightParts(text: string, needle: string): { before: string; match: string; after: string } | null {
  const index = text.toLowerCase().indexOf(needle.toLowerCase());
  if (index < 0) return null;
  return {
    before: text.slice(0, index),
    match: text.slice(index, index + needle.length),
    after: text.slice(index + needle.length),
  };
}

export function pickVocabIds(store: AppStore, options: VocabOptions = {}): string[] {
  if (options.ids?.length) return options.ids;

  let ids = VOCABULARY.map((item) => item.id);
  if (options.topic) ids = ids.filter((id) => VOCAB_BY_ID[id].topic === options.topic);

  const n = options.n ?? 20;
  const mode = options.mode ?? "smart";
  if (mode === "wrong") ids = shuffle(ids.filter((id) => store.v[id]?.last === "w"));
  else if (mode === "new") ids = shuffle(ids.filter((id) => isVocabNew(store, id)));
  else if (mode === "random") ids = shuffle(ids);
  else ids = smartVocabQueue(ids, store, n);

  return ids.slice(0, n);
}

export function smartVocabQueue(ids: string[], store: AppStore, n: number): string[] {
  const due = shuffle(ids.filter((id) => isVocabDue(store, id))).sort(
    (a, b) => vocabRecord(store, a).box - vocabRecord(store, b).box,
  );
  const wrong = shuffle(ids.filter((id) => !isVocabDue(store, id) && store.v[id]?.last === "w"));
  const fresh = shuffle(ids.filter((id) => isVocabNew(store, id)));
  const rest = shuffle(ids.filter((id) => !isVocabDue(store, id) && !isVocabNew(store, id) && store.v[id]?.last !== "w")).sort(
    (a, b) => vocabRecord(store, a).box - vocabRecord(store, b).box,
  );

  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of [...due, ...wrong, ...fresh, ...rest]) {
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
    if (out.length >= n) break;
  }
  return out;
}

export function buildQuizChoices(ids: string[]): Record<string, VocabQuizChoice> {
  const choices: Record<string, VocabQuizChoice> = {};
  for (const id of ids) {
    const entry = VOCAB_BY_ID[id];
    const pool = VOCABULARY.filter((item) => item.id !== id && item.en !== entry.en);
    const distractors = shuffle(pool).slice(0, 3);
    const options = shuffle([entry, ...distractors]);
    choices[id] = {
      options: options.map((item) => item.en),
      k: options.findIndex((item) => item.id === id),
    };
  }
  return choices;
}

export function vocabStats(store: AppStore) {
  const seen = VOCABULARY.filter((item) => !isVocabNew(store, item.id)).length;
  const due = VOCABULARY.filter((item) => isVocabDue(store, item.id)).length;
  const wrong = VOCABULARY.filter((item) => store.v[item.id]?.last === "w").length;
  const mastered = VOCABULARY.filter((item) => (store.v[item.id]?.box ?? 0) >= 3).length;
  return { seen, due, wrong, mastered, waiting: due + wrong };
}

export type CategoryId =
  | "rights"
  | "state"
  | "elections"
  | "law"
  | "social"
  | "jewish"
  | "ns"
  | "ddr"
  | "eu"
  | "family"
  | "culture"
  | "bayern";

export interface Question {
  i: number;
  c: CategoryId;
  q: string;
  a: string[];
  k: number;
  eq: string;
  ea: string[];
  img?: string;
  alt?: string;
}

export interface ProgressRecord {
  box: number;
  last: "r" | "w" | null;
  at: number;
  due: number;
  seen: number;
  ok: number;
  ko: number;
}

export interface DayStats {
  n: number;
  ok: number;
}

export interface TestHistoryEntry {
  at: number;
  score: number;
  secs: number;
}

export interface AppConfig {
  exam: string;
  goal: number;
  en: boolean;
}

export type VocabTopic = "staat" | "recht" | "wahlen" | "arbeit" | "geschichte" | "gesellschaft" | "bayern";

export type VocabPos = "noun" | "verb" | "adj" | "phrase";

export interface VocabEntry {
  id: string;
  word: string;
  form: string;
  pos: VocabPos;
  gender?: "m" | "f" | "n";
  plural?: string;
  forms?: string;
  en: string;
  hint?: string;
  topic: VocabTopic;
  q: number;
}

export interface AppStore {
  p: Record<string, ProgressRecord>;
  v: Record<string, ProgressRecord>;
  days: Record<string, DayStats>;
  tests: TestHistoryEntry[];
  cfg: AppConfig;
}

export type LearnMode = "smart" | "wrong" | "new" | "all" | "random" | "cat" | "single";

export interface LearnOptions {
  mode: LearnMode;
  cat?: CategoryId;
  n?: number;
  ids?: number[];
}

export type CardsMode = "smart" | "wrong" | "new" | "random";

export interface CardsOptions {
  mode?: CardsMode;
  cat?: CategoryId | "";
  n?: number;
}

export interface LearnSession {
  id: string;
  queue: number[];
  idx: number;
  answered: number;
  ok: number;
  wrongIds: number[];
  title: string;
  total: number;
  retryIds: number[];
}

export interface CardsSession {
  id: string;
  ids: number[];
  idx: number;
  ok: number;
  ko: number;
  flipped: boolean;
}

export interface TestSession {
  id: string;
  ids: number[];
  ans: Record<number, number>;
  idx: number;
  start: number;
  secs: number;
  endedAt?: number;
  score?: number;
  done?: boolean;
}

export type VocabMode = "smart" | "wrong" | "new" | "random";

export interface VocabOptions {
  mode?: VocabMode;
  topic?: VocabTopic | "";
  n?: number;
  ids?: string[];
  kind?: "cards" | "quiz";
}

export interface VocabQuizChoice {
  options: string[];
  k: number;
}

export interface VocabSession {
  id: string;
  ids: string[];
  idx: number;
  ok: number;
  ko: number;
  flipped: boolean;
  kind: "cards" | "quiz";
  choices: Record<string, VocabQuizChoice>;
  picked: number | null;
}

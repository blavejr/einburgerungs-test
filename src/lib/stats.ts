import { MASTERED_BOX } from "@/data/constants";
import { QUESTIONS } from "@/data/questions";
import { todayKey } from "@/lib/dates";
import { currentStreak, isDue, isNew } from "@/lib/progress";
import type { AppStore, CategoryId } from "@/types";

export function getTodayStats(store: AppStore) {
  return store.days[todayKey()] ?? { n: 0, ok: 0 };
}

export function countDue(store: AppStore): number {
  return QUESTIONS.filter((q) => isDue(store, q.i)).length;
}

export function countWrong(store: AppStore): number {
  return QUESTIONS.filter((q) => store.p[q.i]?.last === "w").length;
}

export function countSeen(store: AppStore): number {
  return QUESTIONS.filter((q) => !isNew(store, q.i)).length;
}

export function countMastered(store: AppStore): number {
  return QUESTIONS.filter((q) => (store.p[q.i]?.box ?? 0) >= MASTERED_BOX).length;
}

export function categoryBreakdown(store: AppStore, category: CategoryId) {
  const ids = QUESTIONS.filter((q) => q.c === category).map((q) => q.i);
  const mastered = ids.filter((id) => (store.p[id]?.box ?? 0) >= MASTERED_BOX).length;
  const learning = ids.filter((id) => {
    const rec = store.p[id];
    return Boolean(rec?.seen && rec.box < MASTERED_BOX && rec.last === "r");
  }).length;
  const wrong = ids.filter((id) => store.p[id]?.last === "w").length;
  return { ids, mastered, learning, wrong };
}

export function dashboardStats(store: AppStore) {
  const today = getTodayStats(store);
  const due = countDue(store);
  const wrong = countWrong(store);
  return {
    today,
    streak: currentStreak(store.days),
    seen: countSeen(store),
    mastered: countMastered(store),
    due,
    wrong,
    waiting: due + wrong,
  };
}

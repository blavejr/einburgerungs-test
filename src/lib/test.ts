import { TEST_FEDERAL, TEST_STATE } from "@/data/constants";
import { QUESTIONS, QUESTIONS_BY_ID } from "@/data/questions";
import { shuffle } from "@/lib/shuffle";

export function createOfficialTestIds(): number[] {
  const federal = shuffle(QUESTIONS.filter((q) => q.c !== "bayern").map((q) => q.i)).slice(0, TEST_FEDERAL);
  const state = shuffle(QUESTIONS.filter((q) => q.c === "bayern").map((q) => q.i)).slice(0, TEST_STATE);
  return [...federal, ...state];
}

export function scoreTest(ids: number[], answers: Record<number, number>): number {
  return ids.reduce((sum, id) => sum + (answers[id] === QUESTIONS_BY_ID[id].k ? 1 : 0), 0);
}

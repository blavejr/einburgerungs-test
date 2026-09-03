import type { Question } from "@/types";
import raw from "./questions.json";

export const QUESTIONS = raw as Question[];
export const QUESTIONS_BY_ID: Record<number, Question> = Object.fromEntries(
  QUESTIONS.map((q) => [q.i, q]),
);
export const TOTAL_QUESTIONS = QUESTIONS.length;

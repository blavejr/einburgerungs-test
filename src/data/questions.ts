import type { Question } from "@/types";
import explanations from "./explanations.json";
import raw from "./questions.json";

type QuestionSource = Omit<Question, "info" | "einfo">;
type Explanation = { info: string; einfo: string };

const INFO_BY_ID = explanations as Record<string, Explanation>;

export const QUESTIONS: Question[] = (raw as QuestionSource[]).map((question) => {
  const extra = INFO_BY_ID[String(question.i)];
  return {
    ...question,
    info: extra?.info ?? "",
    einfo: extra?.einfo ?? "",
  };
});
export const QUESTIONS_BY_ID: Record<number, Question> = Object.fromEntries(
  QUESTIONS.map((q) => [q.i, q]),
);
export const TOTAL_QUESTIONS = QUESTIONS.length;

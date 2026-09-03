import { useState } from "react";
import { IMAGE_BASE } from "@/data/constants";
import type { Question } from "@/types";

export function QuestionImage({ question }: { question: Question }) {
  const [failed, setFailed] = useState(false);
  if (!question.img) return null;
  if (failed) {
    return <div className="alt">Bild nicht geladen · {question.alt}</div>;
  }

  return (
    <img
      src={`${IMAGE_BASE}${question.img}.png`}
      alt={question.alt ?? ""}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}

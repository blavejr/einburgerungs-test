import { useState } from "react";
import type { Question } from "@/types";

export function AnswerInfo({
  question,
  english,
  defaultOpen = false,
}: {
  question: Question;
  english: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  if (!question.info) return null;

  if (!open) {
    return (
      <button type="button" className="info-toggle" onClick={() => setOpen(true)}>
        Warum ist das so?
      </button>
    );
  }

  return (
    <div className="q-info" role="region" aria-label="Erklärung">
      <div className="q-info-head">
        <span className="q-info-label">Zum Verständnis</span>
        {!defaultOpen && (
          <button type="button" className="info-hide" onClick={() => setOpen(false)}>
            Einklappen
          </button>
        )}
      </div>
      <p>{question.info}</p>
      {english && question.einfo ? <p className="en">{question.einfo}</p> : null}
    </div>
  );
}

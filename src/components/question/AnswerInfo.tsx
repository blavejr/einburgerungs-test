import { useState } from "react";
import { EnglishToggle } from "@/components/ui/EnglishToggle";
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
      <div className="info-row">
        <button type="button" className="info-toggle" onClick={() => setOpen(true)}>
          Warum ist das so?
          {english ? <span className="en">Why is that?</span> : null}
        </button>
        <EnglishToggle />
      </div>
    );
  }

  return (
    <div className="q-info" role="region" aria-label={english ? "Explanation" : "Erklärung"}>
      <div className="q-info-head">
        <span className="q-info-label">{english ? "Zum Verständnis · Why this is right" : "Zum Verständnis"}</span>
        <div className="q-info-tools">
          <EnglishToggle />
          {!defaultOpen && (
            <button type="button" className="info-hide" onClick={() => setOpen(false)}>
              {english ? "Hide" : "Einklappen"}
            </button>
          )}
        </div>
      </div>
      <p>{question.info}</p>
      {english && question.einfo ? <p className="en">{question.einfo}</p> : null}
    </div>
  );
}

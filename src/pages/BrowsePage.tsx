import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { QuestionItem } from "@/components/question/QuestionItem";
import { CATEGORIES, CATEGORY_ORDER } from "@/data/categories";
import { QUESTIONS } from "@/data/questions";
import { useProgress } from "@/context/ProgressContext";
import { useSession } from "@/context/SessionContext";
import { isNew } from "@/lib/progress";
import type { CategoryId } from "@/types";

export function BrowsePage() {
  const [params] = useSearchParams();
  const { store } = useProgress();
  const { startLearn } = useSession();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<CategoryId | "">((params.get("cat") as CategoryId) || "");
  const [only, setOnly] = useState("");
  const [showAnswers, setShowAnswers] = useState(true);

  const list = useMemo(() => {
    const needle = query.toLowerCase();
    return QUESTIONS.filter((question) => {
      if (cat && question.c !== cat) return false;
      if (
        needle &&
        !`${question.q} ${question.eq} ${question.a.join(" ")} ${question.ea.join(" ")} ${question.info} ${question.einfo}`
          .toLowerCase()
          .includes(needle)
      ) {
        return false;
      }
      if (only === "w") return store.p[question.i]?.last === "w";
      if (only === "n") return isNew(store, question.i);
      if (only === "r") return store.p[question.i]?.last === "r";
      return true;
    });
  }, [cat, only, query, store]);

  return (
    <div className="view">
      <h1>Alle {QUESTIONS.length} Fragen</h1>
      <p className="lead">
        300 Bundesfragen und 10 Bayern-Fragen. Zum Nachschlagen; zum Einprägen lieber Lernen.
        {store.cfg.en && (
          <span className="en-lead">300 federal questions plus 10 for Bavaria. Use this to look things up.</span>
        )}
      </p>
      <div className="filters">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={store.cfg.en ? "Search German or English…" : "Suchen…"}
        />
        <select value={cat} onChange={(event) => setCat(event.target.value as CategoryId | "")}>
          <option value="">Alle Themen</option>
          {CATEGORY_ORDER.map((id) => (
            <option key={id} value={id}>
              {CATEGORIES[id].de}
            </option>
          ))}
        </select>
        <select value={only} onChange={(event) => setOnly(event.target.value)}>
          <option value="">Alle</option>
          <option value="w">Zuletzt falsch</option>
          <option value="n">Noch nie geübt</option>
          <option value="r">Richtig</option>
        </select>
        <button type="button" className={`chip${showAnswers ? " on" : ""}`} onClick={() => setShowAnswers((v) => !v)}>
          Antworten
        </button>
      </div>
      <div className="list">
        {list.length ? (
          list.map((question) => (
            <QuestionItem
              key={question.i}
              question={question}
              showAnswers={showAnswers}
              onPractice={(id) => startLearn({ mode: "single", ids: [id] })}
            />
          ))
        ) : (
          <div className="card" style={{ color: "var(--mute)", fontWeight: 600 }}>
            Nichts gefunden.
          </div>
        )}
      </div>
    </div>
  );
}

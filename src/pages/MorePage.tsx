import { Link } from "react-router";
import { useProgress } from "@/context/ProgressContext";

const ITEMS = [
  {
    to: "/cards",
    title: "Karteikarten",
    en: "Flashcards",
    de: "Frage lesen, Antwort selbst sagen, dann aufdecken.",
    hint: "Read the question, say the answer, then flip.",
  },
  {
    to: "/browse",
    title: "Alle Fragen",
    en: "All questions",
    de: "Katalog zum Nachschlagen – mit Antwort und Erklärung.",
    hint: "Look up any question with its answer and explanation.",
  },
  {
    to: "/map",
    title: "Fortschrittskarte",
    en: "Progress map",
    de: "Jede Frage als Kästchen: grün sitzt, rot war falsch.",
    hint: "Each box is a question: green is solid, red was wrong.",
  },
  {
    to: "/settings",
    title: "Einstellungen",
    en: "Settings",
    de: "Prüfungstermin, Tagesziel, Konto und Export.",
    hint: "Exam date, daily goal, account and export.",
  },
] as const;

export function MorePage() {
  const { store } = useProgress();

  return (
    <div className="view setup">
      <h1>Mehr</h1>
      <p className="lead">
        Alles, was du nicht jeden Tag brauchst.
        {store.cfg.en && <span className="en-lead">The quieter tools — flashcards, the full list, progress, settings.</span>}
      </p>
      <div className="more-list">
        {ITEMS.map((item) => (
          <Link key={item.to} to={item.to} className="more-item">
            <span className="t">
              {item.title}
              {store.cfg.en ? <small>{item.en}</small> : null}
            </span>
            <span className="d">
              {item.de}
              {store.cfg.en ? <span className="en">{item.hint}</span> : null}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

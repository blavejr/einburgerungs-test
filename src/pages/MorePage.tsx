import { Link } from "react-router";
import { useProgress } from "@/context/ProgressContext";

const ITEMS = [
  {
    to: "/topics",
    title: "Themen",
    en: "Topics",
    de: "Nach Grundrechte, Wahlen, Bayern… getrennt üben.",
    hint: "Practice one subject at a time.",
  },
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
    de: "Katalog zum Nachschlagen.",
    hint: "Look up any question.",
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
    de: "Prüfungstermin, Tagesziel, Konto.",
    hint: "Exam date, daily goal, account.",
  },
] as const;

export function MorePage() {
  const { store } = useProgress();

  return (
    <div className="view setup">
      <h1>Mehr</h1>
      <p className="lead">
        Themen, Karten, Katalog und Einstellungen.
        {store.cfg.en && <span className="en-lead">Topics, flashcards, the full list, and settings.</span>}
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

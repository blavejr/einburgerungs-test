import { useState } from "react";
import { Link } from "react-router";
import { ChipGroup } from "@/components/ui/ChipGroup";
import { CATEGORIES, CATEGORY_ORDER } from "@/data/categories";
import { useProgress } from "@/context/ProgressContext";
import { useSession } from "@/context/SessionContext";
import { useToast } from "@/context/ToastContext";
import type { CardsMode, CategoryId, LearnMode } from "@/types";

const MODES: { value: LearnMode; label: string }[] = [
  { value: "smart", label: "Empfohlen" },
  { value: "wrong", label: "Meine Fehler" },
  { value: "new", label: "Neue Fragen" },
  { value: "cat", label: "Ein Thema" },
  { value: "random", label: "Zufällig" },
  { value: "all", label: "Der Reihe nach" },
];

export function LearnPage() {
  const { store } = useProgress();
  const { startLearn, startCards } = useSession();
  const { toast } = useToast();
  const [kind, setKind] = useState<"quiz" | "cards">("quiz");
  const [mode, setMode] = useState<LearnMode>("smart");
  const [cat, setCat] = useState<CategoryId | null>(null);
  const [n, setN] = useState(store.cfg.goal);

  return (
    <div className="view setup">
      <h1>Lernen</h1>
      <p className="lead">
        Eine Frage, eine Antwort, sofort Bescheid. Falsche kommen gleich noch einmal. Richtig,
        aber unsicher? <b>Noch unsicher</b> holt die Frage nach ein paar anderen zurück.
        {store.cfg.en && (
          <span className="en-lead">
            One question, one answer, instant feedback. Misses come back a few questions later. Right
            but shaky? <b>Noch unsicher</b> brings it back after a few others.
          </span>
        )}
      </p>
      <div className="card">
        <div className="grp">
          <div className="l">Wie?</div>
          <div className="kind-toggle">
            <button type="button" className={kind === "quiz" ? "on" : ""} onClick={() => setKind("quiz")}>
              Fragen
              <small>Tippen, dann Erklärung</small>
            </button>
            <button
              type="button"
              className={kind === "cards" ? "on" : ""}
              onClick={() => {
                setKind("cards");
                if (mode === "all") setMode("smart");
              }}
            >
              Karten
              <small>Selbst erinnern, dann aufdecken</small>
            </button>
          </div>
        </div>
        <div className="grp">
          <div className="l">Welche Fragen?</div>
          <ChipGroup
            options={kind === "cards" ? MODES.filter((item) => item.value !== "all") : MODES}
            value={mode}
            onChange={setMode}
          />
          {mode === "smart" && (
            <p className="grp-hint">
              Zuerst was fällig oder falsch war, dann Neues.{" "}
              <Link to="/topics">Nur ein Thema →</Link>
            </p>
          )}
        </div>
        {mode === "cat" && (
          <div className="grp">
            <div className="l">Thema</div>
            <ChipGroup
              options={CATEGORY_ORDER.map((id) => ({ value: id, label: CATEGORIES[id].de }))}
              value={cat ?? ("" as CategoryId)}
              onChange={setCat}
            />
          </div>
        )}
        <div className="grp">
          <div className="l">Wie viele?</div>
          <ChipGroup
            options={[
              { value: 10, label: "10" },
              { value: 20, label: "20" },
              { value: store.cfg.goal, label: `${store.cfg.goal} heute` },
              { value: 999, label: "alle" },
            ]}
            value={n}
            onChange={setN}
          />
        </div>
        <div className="row" style={{ marginTop: 8 }}>
          <button
            type="button"
            className="btn gold"
            onClick={() => {
              if (mode === "cat" && !cat) return toast("Bitte ein Thema wählen");
              if (kind === "cards") {
                const cardMode: CardsMode =
                  mode === "wrong" || mode === "new" || mode === "random" ? mode : "smart";
                startCards({ mode: cardMode, cat: mode === "cat" ? (cat ?? "") : "", n });
                return;
              }
              startLearn({ mode, cat: cat ?? undefined, n });
            }}
          >
            Los
          </button>
          <span className="hint-inline">
            <span className="kbd">1</span>–<span className="kbd">4</span> Antwort · <span className="kbd">E</span>{" "}
            Englisch
          </span>
        </div>
      </div>
    </div>
  );
}

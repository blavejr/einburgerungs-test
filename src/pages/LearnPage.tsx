import { useState } from "react";
import { ChipGroup } from "@/components/ui/ChipGroup";
import { CATEGORIES, CATEGORY_ORDER } from "@/data/categories";
import { useProgress } from "@/context/ProgressContext";
import { useSession } from "@/context/SessionContext";
import { useToast } from "@/context/ToastContext";
import type { CategoryId, LearnMode } from "@/types";

const MODES: { value: LearnMode; label: string }[] = [
  { value: "smart", label: "Kluge Wiederholung" },
  { value: "wrong", label: "Nur Fehler" },
  { value: "new", label: "Nur neue" },
  { value: "all", label: "Alle (Reihenfolge)" },
  { value: "random", label: "Alle (zufällig)" },
  { value: "cat", label: "Thema…" },
];

export function LearnPage() {
  const { store } = useProgress();
  const { startLearn } = useSession();
  const { toast } = useToast();
  const [mode, setMode] = useState<LearnMode>("smart");
  const [cat, setCat] = useState<CategoryId | null>(null);
  const [n, setN] = useState(store.cfg.goal);

  return (
    <div className="view setup">
      <h1>Lernen</h1>
      <p className="lead">
        Antwort tippen, sofort sehen ob richtig. Bei Fehlern erscheint eine kurze Erklärung; nach
        einer richtigen Antwort kannst du sie dir ansehen. Falsche Fragen kommen später noch einmal.
      </p>
      <div className="card">
        <div className="grp">
          <div className="l">Was?</div>
          <ChipGroup options={MODES} value={mode} onChange={setMode} />
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
          <div className="l">Wie viele Fragen?</div>
          <ChipGroup
            options={[
              { value: 10, label: "10" },
              { value: 20, label: "20" },
              { value: store.cfg.goal, label: `${store.cfg.goal} (Tagesziel)` },
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
              startLearn({ mode, cat: cat ?? undefined, n });
            }}
          >
            Los geht's
          </button>
          <span className="kbd">1–4</span>
          <span style={{ fontSize: 12, color: "var(--mute)", fontWeight: 600 }}>antworten,</span>
          <span className="kbd">Enter</span>
          <span style={{ fontSize: 12, color: "var(--mute)", fontWeight: 600 }}>weiter</span>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { ChipGroup } from "@/components/ui/ChipGroup";
import { CATEGORIES, CATEGORY_ORDER } from "@/data/categories";
import { useProgress } from "@/context/ProgressContext";
import { useSession } from "@/context/SessionContext";
import type { CardsMode, CategoryId } from "@/types";

const MODES: { value: CardsMode; label: string }[] = [
  { value: "smart", label: "Empfohlen" },
  { value: "wrong", label: "Meine Fehler" },
  { value: "new", label: "Neue Fragen" },
  { value: "random", label: "Zufällig" },
];

export function CardsPage() {
  const { store } = useProgress();
  const { startCards } = useSession();
  const [mode, setMode] = useState<CardsMode>("smart");
  const [cat, setCat] = useState<CategoryId | "">("");
  const [n, setN] = useState(20);

  return (
    <div className="view setup">
      <h1>Karteikarten</h1>
      <p className="lead">
        Frage lesen, Antwort selbst sagen, dann aufdecken. Ehrlich bewerten.
        {store.cfg.en && <span className="en-lead">Read the question, say the answer, then flip. Grade yourself honestly.</span>}
      </p>
      <div className="card">
        <div className="grp">
          <div className="l">Auswahl</div>
          <ChipGroup options={MODES} value={mode} onChange={setMode} />
        </div>
        <div className="grp">
          <div className="l">Thema (optional)</div>
          <ChipGroup
            options={[
              { value: "" as const, label: "Alle" },
              ...CATEGORY_ORDER.map((id) => ({ value: id, label: CATEGORIES[id].de })),
            ]}
            value={cat}
            onChange={setCat}
          />
        </div>
        <div className="grp">
          <div className="l">Anzahl</div>
          <ChipGroup
            options={[
              { value: 10, label: "10" },
              { value: 20, label: "20" },
              { value: 40, label: "40" },
              { value: 999, label: "alle" },
            ]}
            value={n}
            onChange={setN}
          />
        </div>
        <button type="button" className="btn gold" onClick={() => startCards({ mode, cat, n })}>
          Karten starten
        </button>
      </div>
    </div>
  );
}

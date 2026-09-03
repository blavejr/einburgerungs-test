import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { AccountCard } from "@/components/auth/AccountCard";
import { INTERVALS } from "@/data/constants";
import { useProgress } from "@/context/ProgressContext";
import { useToast } from "@/context/ToastContext";

export function SettingsPage() {
  const navigate = useNavigate();
  const { store, cloudSaving, setCfg, exportJson, importStore, reset } = useProgress();
  const { toast } = useToast();
  const [exam, setExam] = useState(store.cfg.exam);
  const [goal, setGoal] = useState(String(store.cfg.goal));
  const [en, setEn] = useState(store.cfg.en);
  const [json, setJson] = useState("");
  const jsonRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="view setup settings">
      <h1>Einstellungen</h1>
      <h2>Konto</h2>
      <AccountCard saving={cloudSaving} />

      <h2>Prüfung</h2>
      <div className="card">
        <label htmlFor="st-exam">Prüfungstermin</label>
        <input id="st-exam" type="date" value={exam} onChange={(event) => setExam(event.target.value)} />
        <label htmlFor="st-goal">Tagesziel (Fragen pro Tag)</label>
        <input
          id="st-goal"
          type="number"
          min={5}
          max={310}
          value={goal}
          onChange={(event) => setGoal(event.target.value)}
        />
        <label htmlFor="st-en">Englische Übersetzung standardmäßig anzeigen</label>
        <select id="st-en" value={en ? "1" : "0"} onChange={(event) => setEn(event.target.value === "1")}>
          <option value="1">Ja</option>
          <option value="0">Nein</option>
        </select>
        <div className="row" style={{ marginTop: 16 }}>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setCfg({
                exam: exam || store.cfg.exam,
                goal: Math.max(5, Number(goal) || 40),
                en,
              });
              toast("Gespeichert");
            }}
          >
            Speichern
          </button>
        </div>
      </div>

      <h2>Fortschritt sichern</h2>
      <div className="card">
        <p style={{ margin: "0 0 10px", color: "var(--ink2)", fontSize: 14 }}>
          Mit Konto liegt der Stand in der Cloud. Zusätzlich merkt ihn dieser Browser, und du kannst
          ihn hier als Text exportieren.
        </p>
        <div className="row">
          <button
            type="button"
            className="btn sec"
            onClick={() => {
              const next = exportJson();
              setJson(next);
              requestAnimationFrame(() => jsonRef.current?.select());
              toast("Text markiert – kopieren");
            }}
          >
            Exportieren
          </button>
          <button
            type="button"
            className="btn sec"
            onClick={() => {
              try {
                if (!importStore(JSON.parse(json))) throw new Error("invalid");
                toast("Importiert");
              } catch {
                toast("Ungültiger Export");
              }
            }}
          >
            Importieren
          </button>
          <button
            type="button"
            className="btn ghost"
            style={{ color: "var(--red)" }}
            onClick={() => {
              if (confirm("Wirklich allen Fortschritt löschen?")) {
                reset();
                toast("Zurückgesetzt");
                navigate("/");
              }
            }}
          >
            Alles zurücksetzen
          </button>
        </div>
        <textarea
          ref={jsonRef}
          value={json}
          onChange={(event) => setJson(event.target.value)}
          placeholder="Export erscheint hier / Import hier einfügen"
          style={{ marginTop: 10 }}
        />
      </div>

      <h2>Wie der Trainer lernt</h2>
      <div className="card" style={{ fontSize: "14.5px", color: "var(--ink2)", lineHeight: 1.55 }}>
        <p style={{ marginTop: 0 }}>
          <b style={{ color: "var(--ink)" }}>Abstandslernen.</b> Jede Frage hat eine Stufe 0–5.
          Richtig → eine Stufe hoch und erst nach {INTERVALS.slice(1).join(", ")} Tagen wieder fällig.
          Falsch → zurück auf 0 und sofort fällig. Wiederholen kurz bevor man vergisst, ist
          effizienter als jeden Tag alles.
        </p>
        <p>
          <b style={{ color: "var(--ink)" }}>Aktives Erinnern.</b> Karteikarten zwingen dich, die
          Antwort selbst zu produzieren statt sie nur wiederzuerkennen. Unter Wörter lernst du
          einzelne Prüfungsvokabeln genauso.
        </p>
        <p>
          <b style={{ color: "var(--ink)" }}>Sofortige Korrektur + Wiederholung in der Sitzung.</b>{" "}
          Falsche Fragen kommen vier Fragen später noch einmal, solange die Erinnerung frisch ist.
        </p>
        <p>
          <b style={{ color: "var(--ink)" }}>Interleaving.</b> Neue Fragen werden themenübergreifend
          gemischt – anstrengender, aber besser für die Prüfung, wo alles durcheinander kommt.
        </p>
        <p style={{ marginBottom: 0 }}>
          <b style={{ color: "var(--ink)" }}>Sichtbarer Fortschritt.</b> Die Karte, die Serie und das
          Tagesziel machen jeden Tag einen kleinen Gewinn – und Verlust – sichtbar.
        </p>
      </div>
    </div>
  );
}

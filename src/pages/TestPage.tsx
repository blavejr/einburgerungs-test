import { PASS_SCORE } from "@/data/constants";
import { useProgress } from "@/context/ProgressContext";
import { useSession } from "@/context/SessionContext";

export function TestPage() {
  const { store, setCfg } = useProgress();
  const { startTest } = useSession();
  const history = store.tests.slice(-8).reverse();

  return (
    <div className="view setup">
      <h1>Prüfungssimulation</h1>
      <p className="lead">
        Wie im echten Test: 30 Fragen aus dem Bundeskatalog + 3 Fragen zu Bayern, 60 Minuten, keine
        Rückmeldung bis zum Schluss. Bestanden ab {PASS_SCORE} richtigen Antworten.
      </p>
      <div className="card">
        <div className="row">
          <button type="button" className="btn gold" onClick={startTest}>
            Prüfung starten
          </button>
          <label style={{ fontSize: 14, fontWeight: 600, color: "var(--ink2)", display: "flex", gap: 6, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={store.cfg.en}
              onChange={(event) => setCfg({ en: event.target.checked })}
            />
            Englisch anzeigen
          </label>
        </div>
      </div>
      {history.length > 0 && (
        <>
          <h2>Bisherige Prüfungen</h2>
          <div className="list">
            {history.map((entry) => (
              <div className="item" key={entry.at}>
                <div className="h">
                  <div className="id">{entry.score}/33</div>
                  <div>
                    <b style={{ color: entry.score >= PASS_SCORE ? "var(--green-deep)" : "var(--red-deep)" }}>
                      {entry.score >= PASS_SCORE ? "Bestanden" : "Nicht bestanden"}
                    </b>
                    {" · "}
                    {new Date(entry.at).toLocaleString("de-DE")} · {Math.round(entry.secs / 60)} min
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

import { PASS_SCORE } from "@/data/constants";
import { useProgress } from "@/context/ProgressContext";
import { useSession } from "@/context/SessionContext";

export function TestPage() {
  const { store } = useProgress();
  const { startTest } = useSession();
  const history = store.tests.slice(-8).reverse();

  return (
    <div className="view setup">
      <h1>Prüfung</h1>
      <p className="lead">
        Wie im echten Test: 30 Bundesfragen + 3 zu Bayern, 60 Minuten, erst am Ende die Auswertung.
        Bestanden ab {PASS_SCORE} richtigen.
        {store.cfg.en && (
          <span className="en-lead">
            Same as the real exam: 30 federal + 3 Bavaria, 60 minutes, no feedback until the end. Pass at {PASS_SCORE}.
          </span>
        )}
      </p>
      <div className="card">
        <button type="button" className="btn gold" onClick={startTest}>
          Prüfung starten
        </button>
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

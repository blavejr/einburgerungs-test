import { useNavigate } from "react-router";
import { GoalRing } from "@/components/progress/GoalRing";
import { ProgressMap } from "@/components/progress/ProgressMap";
import { CATEGORIES, CATEGORY_ORDER } from "@/data/categories";
import { TOTAL_QUESTIONS } from "@/data/questions";
import { useProgress } from "@/context/ProgressContext";
import { useSession } from "@/context/SessionContext";
import { useToast } from "@/context/ToastContext";
import { daysToExam } from "@/lib/dates";
import { categoryBreakdown, dashboardStats } from "@/lib/stats";

export function HomePage() {
  const navigate = useNavigate();
  const { store } = useProgress();
  const { startLearn, startCards } = useSession();
  const { toast } = useToast();
  const stats = dashboardStats(store);
  const remaining = daysToExam(store.cfg.exam);
  const goalPercent = Math.round((stats.today.n / store.cfg.goal) * 100);
  const lastTest = store.tests.at(-1);

  return (
    <div className="view">
      <h1>
        Hallo. {remaining > 0 ? <>Noch <b>{remaining} Tage</b>.</> : "Prüfungstag!"}{" "}
      </h1>
      <p className="lead">
        33 Fragen, 60 Minuten, 17 richtig reicht. Der Trainer zeigt dir zuerst, was fällig oder
        falsch war, mischt die Themen und wiederholt in wachsenden Abständen – so bleibt es hängen.
      </p>

      <div className="numbers">
        <div className="num goal">
          <div className="v">
            {stats.today.n}
            <span style={{ fontSize: 15, color: "var(--mute)" }}>/{store.cfg.goal}</span>
          </div>
          <div className="l">heute beantwortet</div>
          <GoalRing percent={goalPercent} />
        </div>
        <div className="num">
          <div className="v">{stats.streak}</div>
          <div className="l">Tage in Folge</div>
        </div>
        <div className="num">
          <div className="v">
            {stats.mastered}
            <span style={{ fontSize: 15, color: "var(--mute)" }}>/{TOTAL_QUESTIONS}</span>
          </div>
          <div className="l">sicher (3× richtig in Folge)</div>
        </div>
        <div className="num">
          <div className="v" style={{ color: stats.waiting ? "var(--red)" : "var(--green)" }}>
            {stats.waiting}
          </div>
          <div className="l">fällig oder zuletzt falsch</div>
        </div>
      </div>

      <h2>Loslegen</h2>
      <div className="starts">
        <button type="button" className="start primary" onClick={() => startLearn({ mode: "smart", n: store.cfg.goal })}>
          <span className="t">Kluge Wiederholung</span>
          <span className="d">Fällige und falsche Fragen zuerst, dann Neues – gemischt über alle Themen.</span>
          <span className="n">
            {stats.waiting
              ? `${stats.waiting} wartend`
              : stats.seen < TOTAL_QUESTIONS
                ? "neue Fragen dran"
                : "alles frisch – Zufallsrunde"}
          </span>
        </button>
        <button
          type="button"
          className="start"
          onClick={() => {
            if (!stats.wrong) return toast("Keine falschen Fragen – stark!");
            startLearn({ mode: "wrong", n: 999 });
          }}
        >
          <span className="t">Nur Fehler</span>
          <span className="d">Alles, was du zuletzt falsch hattest, bis es sitzt.</span>
          <span className="n">{stats.wrong} Fragen</span>
        </button>
        <button type="button" className="start" onClick={() => navigate("/cards")}>
          <span className="t">Karteikarten</span>
          <span className="d">Frage sehen, Antwort im Kopf sagen, dann aufdecken. Aktives Erinnern.</span>
          <span className="n">Selbsteinschätzung</span>
        </button>
        <button type="button" className="start" onClick={() => navigate("/vocab")}>
          <span className="t">Wortschatz</span>
          <span className="d">Schwere Wörter aus den Fragen: Urteil, vertritt, Betrieb… mit einfachem Englisch.</span>
          <span className="n">für B1 · Nachschlagen &amp; Karten</span>
        </button>
        <button type="button" className="start" onClick={() => navigate("/test")}>
          <span className="t">Prüfungssimulation</span>
          <span className="d">30 Fragen + 3 Bayern, 60 Minuten, Ergebnis am Ende wie im echten Test.</span>
          <span className="n">
            {store.tests.length
              ? `${store.tests.length} bisher · letzte ${lastTest?.score}/33`
              : "noch keine"}
          </span>
        </button>
      </div>

      <h2>Deine Karte</h2>
      <div className="card">
        <ProgressMap onSelect={(id) => startLearn({ mode: "single", ids: [id] })} />
      </div>

      <h2>Nach Thema</h2>
      <div className="cats">
        {CATEGORY_ORDER.map((categoryId) => {
          const category = CATEGORIES[categoryId];
          const breakdown = categoryBreakdown(store, categoryId);
          const total = breakdown.ids.length;
          return (
            <div className="cat" key={categoryId}>
              <div className="t">{category.de}</div>
              <div className="s">
                {category.en} · {total} Fragen · {breakdown.mastered} sicher
              </div>
              <div className="bar">
                <i className="g" style={{ width: `${(breakdown.mastered / total) * 100}%` }} />
                <i className="y" style={{ width: `${(breakdown.learning / total) * 100}%` }} />
                <i className="r" style={{ width: `${(breakdown.wrong / total) * 100}%` }} />
              </div>
              <div className="acts">
                <button type="button" className="btn sm sec" onClick={() => startLearn({ mode: "cat", cat: categoryId, n: 999 })}>
                  Lernen
                </button>
                <button type="button" className="btn sm ghost" onClick={() => startCards({ cat: categoryId })}>
                  Karten
                </button>
                <button type="button" className="btn sm ghost" onClick={() => navigate(`/browse?cat=${categoryId}`)}>
                  Liste
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

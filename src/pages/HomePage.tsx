import { Link, useNavigate } from "react-router";
import { GoalRing } from "@/components/progress/GoalRing";
import { CATEGORIES, CATEGORY_ORDER } from "@/data/categories";
import { TOTAL_QUESTIONS } from "@/data/questions";
import { useAuth } from "@/context/AuthContext";
import { useProgress } from "@/context/ProgressContext";
import { useSession } from "@/context/SessionContext";
import { useToast } from "@/context/ToastContext";
import { daysToExam } from "@/lib/dates";
import { categoryBreakdown, dashboardStats } from "@/lib/stats";

export function HomePage() {
  const navigate = useNavigate();
  const { store } = useProgress();
  const { user, ready, configured } = useAuth();
  const { startLearn } = useSession();
  const { toast } = useToast();
  const stats = dashboardStats(store);
  const remaining = daysToExam(store.cfg.exam);
  const goalPercent = Math.round((stats.today.n / store.cfg.goal) * 100);
  const lastTest = store.tests.at(-1);
  const freshman = stats.seen === 0;
  const english = store.cfg.en;

  return (
    <div className="view">
      <h1>
        {freshman ? "Willkommen." : "Weiter geht’s."}{" "}
        {remaining > 0 ? (
          <>
            Noch <b>{remaining} Tage</b>.
          </>
        ) : (
          "Prüfungstag!"
        )}
      </h1>
      <p className="lead">
        {freshman
          ? "33 Fragen, 60 Minuten, 17 Richtige reichen. Starte mit einer kurzen Runde – nach jeder Antwort siehst du, warum sie stimmt."
          : "Fällige und falsche Fragen zuerst, dann Neues. Kleine Runden, jeden Tag."}
        {english && (
          <span className="en-lead">
            {freshman
              ? "33 questions, 60 minutes, 17 correct is enough. Start a short round — after each answer you’ll see why it is right."
              : "Due and missed questions first, then new ones. Short rounds, every day."}
          </span>
        )}
      </p>

      {configured && ready && !user ? (
        <div className="account-banner">
          <div>
            <b>Konto speichert den Fortschritt</b>
            <p>Ohne Anmeldung merkt sich nur dieser Browser den Stand – nach einem Refresh oft weg.</p>
          </div>
          <Link to="/settings#konto" className="btn sm">
            Anmelden
          </Link>
        </div>
      ) : null}

      {freshman && (
        <div className="welcome">
          <ol>
            <li>
              <b>Antwort tippen</b>
              {english ? <span className="en">Tap an answer</span> : null}
            </li>
            <li>
              <b>Kurz lesen, warum</b>
              {english ? <span className="en">Read why it is right</span> : null}
            </li>
            <li>
              <b>
                <span className="en-inline">EN</span> oben übersetzt alles
              </b>
              {english ? <span className="en">The EN switch stays visible — no scrolling back</span> : null}
            </li>
          </ol>
        </div>
      )}

      <div className="home-cta">
        <button
          type="button"
          className="start primary"
          onClick={() => startLearn({ mode: "smart", n: freshman ? 10 : store.cfg.goal })}
        >
          <span className="t">{freshman ? "Erste 10 Fragen" : "Heute üben"}</span>
          <span className="d">
            {freshman
              ? "Der einfachste Einstieg. Du kannst jederzeit aufhören."
              : "Fälliges und Fehler zuerst, gemischt über die Themen."}
          </span>
          <span className="n">
            {freshman
              ? "ca. 5 Minuten"
              : stats.waiting
                ? `${stats.waiting} wartend`
                : stats.seen < TOTAL_QUESTIONS
                  ? "neue Fragen dran"
                  : "Zufallsrunde"}
          </span>
        </button>
        <div className="home-alts">
          <button type="button" className="alt" onClick={() => navigate("/cards")}>
            Karten
          </button>
          <button type="button" className="alt" onClick={() => navigate("/vocab")}>
            Wörter
          </button>
          <button type="button" className="alt" onClick={() => navigate("/test")}>
            Prüfung
            {lastTest ? <small>{lastTest.score}/33</small> : null}
          </button>
        </div>
      </div>

      <div className="numbers">
        <div className="num goal">
          <div className="v">
            {stats.today.n}
            <span style={{ fontSize: 15, color: "var(--mute)" }}>/{store.cfg.goal}</span>
          </div>
          <div className="l">heute</div>
          <GoalRing percent={goalPercent} />
        </div>
        <div className="num">
          <div className="v">{stats.streak}</div>
          <div className="l">Serie</div>
        </div>
        <div className="num">
          <div className="v">
            {stats.mastered}
            <span style={{ fontSize: 15, color: "var(--mute)" }}>/{TOTAL_QUESTIONS}</span>
          </div>
          <div className="l">sicher</div>
        </div>
        <div className="num">
          <div className="v" style={{ color: stats.waiting ? "var(--red)" : "var(--green)" }}>
            {stats.waiting}
          </div>
          <div className="l">fällig / falsch</div>
        </div>
      </div>

      <div className="home-links">
        <Link to="/map" className="home-link">
          Fortschrittskarte
          <span>
            {stats.seen}/{TOTAL_QUESTIONS} gesehen
          </span>
        </Link>
        <Link to="/browse" className="home-link">
          Alle Fragen
          <span>nachschlagen</span>
        </Link>
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
                {english ? `${category.en} · ` : ""}
                {total} Fragen · {breakdown.mastered} sicher
              </div>
              <div className="bar">
                <i className="g" style={{ width: `${(breakdown.mastered / total) * 100}%` }} />
                <i className="y" style={{ width: `${(breakdown.learning / total) * 100}%` }} />
                <i className="r" style={{ width: `${(breakdown.wrong / total) * 100}%` }} />
              </div>
              <div className="acts">
                <button
                  type="button"
                  className="btn sm sec"
                  onClick={() => startLearn({ mode: "cat", cat: categoryId, n: 999 })}
                >
                  Lernen
                </button>
                <button type="button" className="btn sm ghost" onClick={() => navigate(`/browse?cat=${categoryId}`)}>
                  Liste
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {stats.wrong > 0 && (
        <p className="home-note">
          <button
            type="button"
            className="btn ghost sm"
            onClick={() => {
              if (!stats.wrong) return toast("Keine falschen Fragen – stark!");
              startLearn({ mode: "wrong", n: 999 });
            }}
          >
            Nur Fehler üben ({stats.wrong})
          </button>
        </p>
      )}
    </div>
  );
}

import { Link } from "react-router";
import { GoalRing } from "@/components/progress/GoalRing";
import { TOTAL_QUESTIONS } from "@/data/questions";
import { useAuth } from "@/context/AuthContext";
import { useProgress } from "@/context/ProgressContext";
import { useSession } from "@/context/SessionContext";
import { daysToExam } from "@/lib/dates";
import { dashboardStats } from "@/lib/stats";

export function HomePage() {
  const { store } = useProgress();
  const { user, ready, configured } = useAuth();
  const { startLearn } = useSession();
  const stats = dashboardStats(store);
  const remaining = daysToExam(store.cfg.exam);
  const goalPercent = Math.round((stats.today.n / store.cfg.goal) * 100);
  const freshman = stats.seen === 0;
  const english = store.cfg.en;

  return (
    <div className="view home">
      <h1>
        {remaining > 0 ? (
          <>
            Noch <b>{remaining} Tage</b>
          </>
        ) : (
          "Prüfungstag"
        )}
      </h1>
      <p className="lead">
        17 von 33 reichen.
        {english && <span className="en-lead">17 of 33 is enough to pass.</span>}
      </p>

      <div className="numbers">
        <div className="num goal">
          <div className="v">
            {stats.today.n}
            <span className="of">/{store.cfg.goal}</span>
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
            <span className="of">/{TOTAL_QUESTIONS}</span>
          </div>
          <div className="l">sicher</div>
        </div>
        <div className="num">
          <div className="v" style={{ color: stats.waiting ? "var(--red)" : "var(--green)" }}>
            {stats.waiting}
          </div>
          <div className="l">fällig</div>
        </div>
      </div>

      <button
        type="button"
        className="home-go"
        onClick={() => startLearn({ mode: "smart", n: freshman ? 10 : store.cfg.goal })}
      >
        <span>{freshman ? "Erste 10 Fragen" : "Heute üben"}</span>
        <small>
          {freshman
            ? english
              ? "about 5 minutes"
              : "ca. 5 Minuten"
            : stats.waiting
              ? `${stats.waiting} wartend`
              : "Empfohlene Runde"}
        </small>
      </button>

      {configured && ready && !user ? (
        <Link to="/settings#konto" className="home-login">
          Anmelden, damit der Stand bleibt
        </Link>
      ) : null}
    </div>
  );
}

import { NavLink } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { useProgress } from "@/context/ProgressContext";
import { daysToExam } from "@/lib/dates";
import { countDue, dashboardStats, getTodayStats } from "@/lib/stats";

const links = [
  { to: "/", label: "Start", end: true },
  { to: "/learn", label: "Lernen" },
  { to: "/cards", label: "Karten" },
  { to: "/vocab", label: "Wörter" },
  { to: "/test", label: "Prüfung" },
  { to: "/browse", label: "Alle Fragen" },
  { to: "/map", label: "Karte" },
  { to: "/settings", label: "⚙" },
] as const;

export function AppHeader() {
  const { store } = useProgress();
  const { user } = useAuth();
  const today = getTodayStats(store);
  const due = countDue(store);
  const streak = dashboardStats(store).streak;

  return (
    <div className="top">
      <div className="top-in">
        <NavLink to="/" end className="brand">
          <span className="flag" />
          Einbürgerungstest <small>Bayern</small>
        </NavLink>
        <div className="stat">
          <span>
            <b>{daysToExam(store.cfg.exam)}</b> Tage bis zur Prüfung
          </span>
          <span>
            <b>{streak}</b> 🔥 Serie
          </span>
          <span>
            Heute <b>{today.n}</b>/{store.cfg.goal}
          </span>
          <span>
            <b>{due}</b> fällig
          </span>
          {user ? (
            <NavLink to="/settings#konto" className="account-chip">
              {user.name}
            </NavLink>
          ) : null}
        </div>
        <nav>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={"end" in link ? link.end : false}
              className={({ isActive }) => (isActive ? "on" : "")}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

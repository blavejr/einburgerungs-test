import { NavLink, useLocation } from "react-router";
import { EnglishToggle } from "@/components/ui/EnglishToggle";
import { useAuth } from "@/context/AuthContext";
import { isMorePath, PRIMARY_NAV } from "@/lib/routes";

export function AppHeader() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const accountLabel = user ? user.name.split(" ")[0] : "Konto";

  return (
    <header className="top">
      <div className="top-in">
        <NavLink to="/" end className="brand">
          <span className="flag" />
          Einbürgerungstest <small>Bayern</small>
        </NavLink>
        <div className="top-tools">
          <EnglishToggle />
          <NavLink to="/settings#konto" className={`account-chip${user ? " in" : ""}`}>
            {accountLabel}
          </NavLink>
        </div>
        <nav className="main-nav" aria-label="Hauptmenü">
          {PRIMARY_NAV.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={"end" in link ? link.end : false}
              className={({ isActive }) => (isActive ? "on" : "")}
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink to="/more" className={isMorePath(pathname) ? "on" : ""}>
            Mehr
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

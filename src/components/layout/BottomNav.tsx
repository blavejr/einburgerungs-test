import { NavLink, useLocation } from "react-router";
import { isMorePath, PRIMARY_NAV } from "@/lib/routes";

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="dock" aria-label="Hauptmenü">
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
  );
}

export function isSessionPath(pathname: string): boolean {
  return (
    pathname.startsWith("/learn/session") ||
    pathname.startsWith("/cards/session") ||
    pathname.startsWith("/vocab/session") ||
    pathname.startsWith("/test/run")
  );
}

export function isMorePath(pathname: string): boolean {
  return (
    pathname === "/more" ||
    pathname.startsWith("/cards") ||
    pathname.startsWith("/browse") ||
    pathname.startsWith("/map") ||
    pathname.startsWith("/settings")
  );
}

export const PRIMARY_NAV = [
  { to: "/", label: "Start", end: true },
  { to: "/learn", label: "Lernen" },
  { to: "/vocab", label: "Wörter" },
  { to: "/test", label: "Prüfung" },
] as const;

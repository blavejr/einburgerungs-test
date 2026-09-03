import { useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export function AccountCard({ saving = false }: { saving?: boolean }) {
  const { user, ready, configured, login, register, logout } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  if (!configured) {
    return (
      <div className="card" id="konto">
        <p style={{ margin: 0, color: "var(--ink2)", fontSize: 14 }}>
          Cloud-Sync ist hier nicht konfiguriert. Lokal bleibt der Fortschritt im Browser.
        </p>
      </div>
    );
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "register") await register(name, email, password);
      else await login(email, password);
      setPassword("");
      toast(mode === "register" ? "Konto erstellt" : "Angemeldet");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Fehler");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card" id="konto">
      {!ready ? (
        <p style={{ margin: 0, color: "var(--ink2)", fontSize: 14 }}>Konto wird geprüft…</p>
      ) : user ? (
        <>
          <p style={{ margin: "0 0 6px", fontWeight: 800 }}>{user.name}</p>
          <p style={{ margin: "0 0 12px", color: "var(--ink2)", fontSize: 14 }}>{user.email}</p>
          <p style={{ margin: "0 0 14px", color: "var(--ink2)", fontSize: 14 }}>
            {saving
              ? "Fortschritt wird gerade in die Cloud geschrieben…"
              : "Fragen, Wörter, Prüfungstermine und Tests hängen an diesem Konto – Handy und Laptop teilen denselben Stand."}
          </p>
          <button
            type="button"
            className="btn sec"
            onClick={async () => {
              await logout();
              toast("Abgemeldet – Stand bleibt in diesem Browser");
            }}
          >
            Abmelden
          </button>
        </>
      ) : (
        <form onSubmit={onSubmit}>
          <p style={{ margin: "0 0 12px", color: "var(--ink2)", fontSize: 14 }}>
            Ohne Konto merkt sich nur dieser Browser den Stand – und mancher Handy-Browser löscht das
            nach einer Weile. Mit Konto liegt er in der Cloud.
          </p>
          <div className="row" style={{ marginBottom: 8 }}>
            <button type="button" className={`chip ${mode === "login" ? "on" : ""}`} onClick={() => setMode("login")}>
              Anmelden
            </button>
            <button
              type="button"
              className={`chip ${mode === "register" ? "on" : ""}`}
              onClick={() => setMode("register")}
            >
              Registrieren
            </button>
          </div>
          {mode === "register" ? (
            <>
              <label htmlFor="acc-name">Name</label>
              <input
                id="acc-name"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </>
          ) : null}
          <label htmlFor="acc-email">E-Mail</label>
          <input
            id="acc-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <label htmlFor="acc-pass">Passwort</label>
          <input
            id="acc-pass"
            type="password"
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
          <div className="row" style={{ marginTop: 16 }}>
            <button type="submit" className="btn" disabled={busy}>
              {busy ? "Bitte warten…" : mode === "register" ? "Konto anlegen" : "Anmelden"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

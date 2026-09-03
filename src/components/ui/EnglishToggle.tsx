import { useProgress } from "@/context/ProgressContext";

export function EnglishToggle() {
  const { store, setCfg } = useProgress();
  const on = store.cfg.en;

  return (
    <button
      type="button"
      className={`en-toggle${on ? " on" : ""}`}
      aria-pressed={on}
      aria-label={on ? "Englisch aus" : "Englisch an"}
      title="Englisch (Taste E)"
      onClick={() => setCfg({ en: !on })}
    >
      EN
      <span>{on ? "an" : "aus"}</span>
    </button>
  );
}

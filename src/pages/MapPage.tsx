import { ProgressMap } from "@/components/progress/ProgressMap";
import { TOTAL_QUESTIONS } from "@/data/questions";
import { useProgress } from "@/context/ProgressContext";
import { useSession } from "@/context/SessionContext";
import { countSeen } from "@/lib/stats";

export function MapPage() {
  const { store } = useProgress();
  const { startLearn } = useSession();
  const seen = countSeen(store);

  return (
    <div className="view">
      <h1>Fortschrittskarte</h1>
      <p className="lead">
        Jedes Kästchen ist eine Frage. Grün sitzt, rot war falsch. Antippen zum Üben. {seen}/
        {TOTAL_QUESTIONS} gesehen.
        {store.cfg.en && (
          <span className="en-lead">Each box is a question. Green is solid, red was wrong. Tap one to practice.</span>
        )}
      </p>
      <div className="card">
        <ProgressMap big onSelect={(id) => startLearn({ mode: "single", ids: [id] })} />
      </div>
    </div>
  );
}

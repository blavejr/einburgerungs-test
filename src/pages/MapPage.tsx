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
        Jedes Kästchen ist eine Frage. Grün wird kräftiger, je öfter du sie hintereinander richtig
        hattest; Rot heißt zuletzt falsch. Klick auf ein Kästchen, um die Frage zu üben. {seen}/
        {TOTAL_QUESTIONS} gesehen.
      </p>
      <div className="card">
        <ProgressMap big onSelect={(id) => startLearn({ mode: "single", ids: [id] })} />
      </div>
    </div>
  );
}

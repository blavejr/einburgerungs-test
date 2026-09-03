import { Navigate, useNavigate } from "react-router";
import { QuestionItem } from "@/components/question/QuestionItem";
import { PASS_SCORE, TEST_LENGTH } from "@/data/constants";
import { QUESTIONS_BY_ID } from "@/data/questions";
import { useSession } from "@/context/SessionContext";
import { shuffle } from "@/lib/shuffle";

export function TestResultPage() {
  const navigate = useNavigate();
  const { test, startTest, startLearn } = useSession();

  if (!test?.done) return <Navigate to="/test" replace />;

  const score = test.score ?? 0;
  const passed = score >= PASS_SCORE;
  const wrong = test.ids.filter((id) => test.ans[id] !== QUESTIONS_BY_ID[id].k);

  return (
    <div className="view result">
      <div className="card" style={{ textAlign: "center", padding: 30 }}>
        <div className={`verdict ${passed ? "pass" : "fail"}`}>{passed ? "Bestanden" : "Nicht bestanden"}</div>
        <div style={{ fontSize: 22, fontWeight: 800, margin: "6px 0" }}>
          {score} / {TEST_LENGTH} richtig
        </div>
        <div style={{ color: "var(--mute)", fontWeight: 600 }}>
          Bestehensgrenze {PASS_SCORE} · Dauer {Math.round(((test.endedAt ?? Date.now()) - test.start) / 60000)} min
        </div>
        <div className="pill-row" style={{ marginTop: 18 }}>
          <button type="button" className="btn gold" onClick={startTest}>
            Neue Prüfung
          </button>
          {score < TEST_LENGTH && (
            <button
              type="button"
              className="btn no"
              onClick={() => startLearn({ mode: "single", ids: shuffle(wrong) })}
            >
              Fehler üben
            </button>
          )}
          <button type="button" className="btn sec" onClick={() => navigate("/")}>
            Übersicht
          </button>
        </div>
      </div>
      <h2>Durchsicht</h2>
      <div className="review">
        {test.ids.map((id, index) => (
          <QuestionItem
            key={id}
            question={QUESTIONS_BY_ID[id]}
            showAnswers
            given={test.ans[id]}
            num={index + 1}
          />
        ))}
      </div>
    </div>
  );
}

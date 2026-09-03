import { useCallback, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { OptionList } from "@/components/question/OptionList";
import { QuestionImage } from "@/components/question/QuestionImage";
import { TEST_LENGTH } from "@/data/constants";
import { QUESTIONS_BY_ID } from "@/data/questions";
import { useProgress } from "@/context/ProgressContext";
import { useSession } from "@/context/SessionContext";
import { useKeyboard } from "@/hooks/useKeyboard";
import { formatTimer } from "@/lib/dates";

export function TestRunPage() {
  const navigate = useNavigate();
  const { store } = useProgress();
  const { test, setTest, finishTest } = useSession();
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!test || test.done) return;
    const interval = window.setInterval(() => {
      const left = test.secs - Math.floor((Date.now() - test.start) / 1000);
      setTick((n) => n + 1);
      if (left <= 0) finishTest();
    }, 1000);
    return () => window.clearInterval(interval);
  }, [finishTest, test]);

  const select = useCallback(
    (index: number) => {
      if (!test) return;
      const id = test.ids[test.idx];
      const atEnd = test.idx >= TEST_LENGTH - 1;
      setTest({
        ...test,
        ans: { ...test.ans, [id]: index },
        idx: atEnd ? test.idx : test.idx + 1,
      });
    },
    [setTest, test],
  );

  useKeyboard(
    useCallback(
      (event: KeyboardEvent) => {
        if (!test) return;
        if (event.key >= "1" && event.key <= "4") {
          select(Number(event.key) - 1);
        } else if (event.key === "ArrowRight" && test.idx < TEST_LENGTH - 1) {
          setTest({ ...test, idx: test.idx + 1 });
        } else if (event.key === "ArrowLeft" && test.idx > 0) {
          setTest({ ...test, idx: test.idx - 1 });
        }
      },
      [select, setTest, test],
    ),
  );

  if (!test || test.done) return <Navigate to="/test" replace />;

  const question = QUESTIONS_BY_ID[test.ids[test.idx]];
  const left = test.secs - Math.floor((Date.now() - test.start) / 1000);
  const answered = Object.keys(test.ans).length;

  return (
    <div className="view">
      <div className="learn-head">
        <button
          type="button"
          className="btn ghost sm"
          onClick={() => {
            if (confirm("Prüfung abbrechen? Nichts wird gespeichert.")) {
              setTest(null);
              navigate("/test");
            }
          }}
        >
          ← Abbrechen
        </button>
        <b>Prüfung</b>
        <span className="grow" />
        <span className={`timer${left < 300 ? " low" : ""}`}>{formatTimer(left)}</span>
      </div>
      <div className="test-nav">
        {test.ids.map((id, index) => (
          <button
            key={id}
            type="button"
            data-i={index}
            className={`${test.ans[id] != null ? "ans" : ""} ${index === test.idx ? "cur" : ""}`}
            onClick={() => setTest({ ...test, idx: index })}
          >
            {index + 1}
          </button>
        ))}
      </div>
      <div className="q">
        <div className="meta">
          <span>
            Frage {test.idx + 1} von {TEST_LENGTH}
          </span>
          {question.c === "bayern" && <span className="catlbl">Bayern</span>}
        </div>
        <p className="qt">{question.q}</p>
        {store.cfg.en && <div className="en">{question.eq}</div>}
        <QuestionImage question={question} />
        <OptionList
          question={question}
          english={store.cfg.en}
          selected={test.ans[question.i] ?? null}
          onSelect={select}
        />
        <div className="q-foot">
          <button
            type="button"
            className="btn sec"
            disabled={test.idx === 0}
            onClick={() => setTest({ ...test, idx: test.idx - 1 })}
          >
            ← Zurück
          </button>
          <span className="hint">
            {answered}/{TEST_LENGTH} beantwortet
          </span>
          {test.idx < TEST_LENGTH - 1 ? (
            <button type="button" className="btn" onClick={() => setTest({ ...test, idx: test.idx + 1 })}>
              Weiter →
            </button>
          ) : (
            <button
              type="button"
              className="btn gold"
              onClick={() => {
                const open = TEST_LENGTH - answered;
                if (open && !confirm(`${open} Fragen sind unbeantwortet. Trotzdem abgeben?`)) return;
                finishTest();
              }}
            >
              Abgeben
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

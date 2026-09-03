import { useCallback, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { CategoryLabel } from "@/components/question/CategoryLabel";
import { OptionList } from "@/components/question/OptionList";
import { QuestionImage } from "@/components/question/QuestionImage";
import { QuestionItem } from "@/components/question/QuestionItem";
import { INTERVALS } from "@/data/constants";
import { QUESTIONS_BY_ID } from "@/data/questions";
import { useProgress } from "@/context/ProgressContext";
import { useSession } from "@/context/SessionContext";
import { useKeyboard } from "@/hooks/useKeyboard";
import { previewBox } from "@/lib/progress";
import { shuffle } from "@/lib/shuffle";

export function LearnSessionPage() {
  const navigate = useNavigate();
  const { store, mark, setCfg } = useProgress();
  const { learn, setLearn, startLearn } = useSession();
  const [chosen, setChosen] = useState<number | null>(null);
  const [early, setEarly] = useState(false);

  const finished = Boolean(learn && (early || learn.idx >= learn.queue.length));
  const question = learn && !finished ? QUESTIONS_BY_ID[learn.queue[learn.idx]] : undefined;
  const record = question ? store.p[question.i] : undefined;

  const answer = useCallback(
    (index: number) => {
      if (!learn || !question || chosen !== null) return;
      const correct = index === question.k;
      mark(question.i, correct);
      setChosen(index);
      setLearn({
        ...learn,
        answered: learn.answered + 1,
        ok: learn.ok + (correct ? 1 : 0),
        wrongIds: correct ? learn.wrongIds : [...learn.wrongIds, question.i],
        retryIds: !correct && !learn.retryIds.includes(question.i)
          ? [...learn.retryIds, question.i]
          : learn.retryIds,
        queue: !correct && !learn.retryIds.includes(question.i)
          ? insertRetry(learn.queue, learn.idx, question.i)
          : learn.queue,
        total: !correct && !learn.retryIds.includes(question.i) ? learn.total + 1 : learn.total,
      });
    },
      [chosen, learn, mark, question, setLearn],
  );

  const goNext = useCallback(() => {
    if (!learn || chosen === null) return;
    setChosen(null);
    setLearn({ ...learn, idx: learn.idx + 1 });
  }, [chosen, learn, setLearn]);

  useKeyboard(
    useCallback(
      (event: KeyboardEvent) => {
        if (!question || finished) return;
        if (event.key >= "1" && event.key <= "4" && chosen === null) {
          answer(Number(event.key) - 1);
        } else if (event.key === "Enter" && chosen !== null) {
          goNext();
        } else if (event.key.toLowerCase() === "e") {
          setCfg({ en: !store.cfg.en });
        }
      },
      [answer, chosen, finished, goNext, question, setCfg, store.cfg.en],
    ),
  );

  if (!learn) return <Navigate to="/learn" replace />;

  if (finished) {
    const percent = learn.answered ? Math.round((learn.ok / learn.answered) * 100) : 0;
    const uniqueWrong = [...new Set(learn.wrongIds)];
    const message =
      percent >= 90
        ? "Sehr stark."
        : percent >= 70
          ? "Gut – die roten noch einmal."
          : "Weiter dranbleiben, die Wiederholung erledigt den Rest.";

    return (
      <div className="view">
        <div className="q done">
          <div className="big">{percent}%</div>
          <div className="sub">
            {learn.ok} von {learn.answered} richtig{early ? " (abgebrochen)" : ""} · {message}
          </div>
          <div className="pill-row">
            {uniqueWrong.length > 0 && (
              <button
                type="button"
                className="btn no"
                onClick={() => startLearn({ mode: "single", ids: shuffle(uniqueWrong) })}
              >
                Fehler wiederholen ({uniqueWrong.length})
              </button>
            )}
            <button type="button" className="btn gold" onClick={() => startLearn({ mode: "smart", n: store.cfg.goal })}>
              Noch eine Runde
            </button>
            <button type="button" className="btn sec" onClick={() => navigate("/")}>
              Zur Übersicht
            </button>
          </div>
          {uniqueWrong.length > 0 && (
            <div style={{ textAlign: "left" }}>
              <h2 style={{ marginTop: 6 }}>Das war falsch</h2>
              <div className="list">
                {uniqueWrong.map((id) => (
                  <QuestionItem key={id} question={QUESTIONS_BY_ID[id]} showAnswers />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!question) return <Navigate to="/learn" replace />;

  const correct = chosen !== null && chosen === question.k;
  const box = chosen !== null ? previewBox(store, question.i, correct) : 0;

  return (
    <div className="view">
      <div className="learn-head">
        <button
          type="button"
          className="btn ghost sm"
          onClick={() => {
            if (learn.answered) setEarly(true);
            else navigate("/");
          }}
        >
          ← Beenden
        </button>
        <b>{learn.title}</b>
        <div className="prog">
          <i style={{ width: `${(learn.answered / learn.total) * 100}%` }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink2)" }}>
          {learn.answered}/{learn.total} · {learn.ok} ✓
        </span>
      </div>
      <div className="q">
        <div className="meta">
          <span>Frage {question.i}</span>
          <CategoryLabel id={question.c} />
          {learn.retryIds.includes(question.i) && <span style={{ color: "var(--red)" }}>Wiederholung</span>}
          {record?.seen ? (
            <span>
              {record.ok}✓ {record.ko}✗ · Stufe {record.box}
            </span>
          ) : (
            <span>neu</span>
          )}
          <button
            type="button"
            className="btn ghost sm"
            style={{ marginLeft: "auto" }}
            onClick={() => setCfg({ en: !store.cfg.en })}
          >
            {store.cfg.en ? "EN aus" : "EN an"}
          </button>
        </div>
        <p className="qt">{question.q}</p>
        {store.cfg.en && <div className="en">{question.eq}</div>}
        <QuestionImage question={question} />
        <OptionList
          question={question}
          english={store.cfg.en}
          selected={chosen}
          disabled={chosen !== null}
          reveal={chosen !== null}
          onSelect={answer}
        />
        {chosen !== null && (
          <div>
            {correct ? (
              <div className="fb ok">
                ✓ Richtig{box >= 3 ? " – sitzt jetzt" : ""}
                <span className="grow" />
                <span style={{ fontWeight: 600, fontSize: 13 }}>
                  nächste Wiederholung in {INTERVALS[box]} Tag{INTERVALS[box] === 1 ? "" : "en"}
                </span>
              </div>
            ) : (
              <div className="fb no">
                ✗ Falsch – richtig ist{" "}
                <b>
                  {question.k + 1}: {question.a[question.k]}
                </b>
                <span className="grow" />
                <span style={{ fontWeight: 600, fontSize: 13 }}>kommt gleich noch einmal</span>
              </div>
            )}
          </div>
        )}
        <div className="q-foot">
          <span className="hint">
            Tasten <span className="kbd">1</span>–<span className="kbd">4</span> · <span className="kbd">Enter</span>{" "}
            weiter · <span className="kbd">E</span> Englisch
          </span>
          {chosen !== null && (
            <button type="button" className="btn" onClick={goNext}>
              Weiter →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function insertRetry(queue: number[], idx: number, id: number): number[] {
  const pos = Math.min(queue.length, idx + 4);
  return [...queue.slice(0, pos), id, ...queue.slice(pos)];
}

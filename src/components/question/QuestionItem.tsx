import { AnswerInfo } from "@/components/question/AnswerInfo";
import { QuestionImage } from "@/components/question/QuestionImage";
import { useProgress } from "@/context/ProgressContext";
import type { Question } from "@/types";

export function QuestionItem({
  question,
  showAnswers = false,
  given,
  num,
  onPractice,
}: {
  question: Question;
  showAnswers?: boolean;
  given?: number;
  num?: number;
  onPractice?: (id: number) => void;
}) {
  const { store } = useProgress();
  const record = store.p[question.i];
  const seen = Boolean(record?.seen);
  const color = seen ? (record?.last === "w" ? "var(--red)" : "var(--green)") : "#D9DCE2";
  const title = seen ? `${record?.ok}✓ ${record?.ko}✗` : "noch nie";

  return (
    <div className="item">
      <div className="h">
        <span className="st" style={{ background: color }} title={title} />
        <div className="id">
          {num ? `${num}·` : ""}
          {question.i}
        </div>
        <div className="grow">
          <div className="qt">{question.q}</div>
          {store.cfg.en && <div className="en">{question.eq}</div>}
          {question.img && (
            <div style={{ marginTop: 6 }}>
              <QuestionImage question={question} />
            </div>
          )}
        </div>
        {onPractice && (
          <div className="acts">
            <button type="button" className="btn ghost sm" onClick={() => onPractice(question.i)}>
              Üben
            </button>
          </div>
        )}
      </div>
      {showAnswers && (
        <ol>
          {question.a.map((answer, index) => {
            const isCorrect = index === question.k;
            const isWrongPick = given != null && given === index && !isCorrect;
            return (
              <li
                key={index}
                className={isCorrect ? "ok" : ""}
                style={isWrongPick ? { background: "var(--red-soft)", color: "var(--red-deep)" } : undefined}
              >
                <b>{index + 1}</b>
                <span>
                  {answer}
                  {store.cfg.en && (
                    <span
                      className="en"
                      style={{ color: isCorrect ? "var(--green-deep)" : "var(--blue)", opacity: 0.85 }}
                    >
                      {question.ea[index]}
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      )}
      {showAnswers && (
        <AnswerInfo question={question} english={store.cfg.en} defaultOpen />
      )}
    </div>
  );
}

import { useCallback } from "react";
import { Navigate, useNavigate } from "react-router";
import { AnswerInfo } from "@/components/question/AnswerInfo";
import { QuestionImage } from "@/components/question/QuestionImage";
import { CATEGORIES } from "@/data/categories";
import { QUESTIONS_BY_ID } from "@/data/questions";
import { useProgress } from "@/context/ProgressContext";
import { useSession } from "@/context/SessionContext";
import { useKeyboard } from "@/hooks/useKeyboard";

export function CardsSessionPage() {
  const navigate = useNavigate();
  const { store, mark } = useProgress();
  const { cards, setCards, startCards } = useSession();

  const flip = useCallback(() => {
    if (!cards || cards.flipped) return;
    setCards({ ...cards, flipped: true });
  }, [cards, setCards]);

  const rate = useCallback(
    (ok: boolean) => {
      if (!cards || !cards.flipped) return;
      const id = cards.ids[cards.idx];
      mark(id, ok);
      setCards({
        ...cards,
        idx: cards.idx + 1,
        ok: cards.ok + (ok ? 1 : 0),
        ko: cards.ko + (ok ? 0 : 1),
        flipped: false,
      });
    },
    [cards, mark, setCards],
  );

  useKeyboard(
    useCallback(
      (event: KeyboardEvent) => {
        if (!cards) return;
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          flip();
        } else if (event.key === "1") rate(false);
        else if (event.key === "2") rate(true);
      },
      [cards, flip, rate],
    ),
  );

  if (!cards) return <Navigate to="/cards" replace />;

  if (cards.idx >= cards.ids.length) {
    return (
      <div className="view">
        <div className="q done">
          <div className="big">
            {cards.ok}/{cards.ids.length}
          </div>
          <div className="sub">gewusst · {cards.ko} nicht gewusst</div>
          <div className="pill-row">
            <button type="button" className="btn gold" onClick={() => startCards({ mode: "smart", n: 20 })}>
              Noch einmal
            </button>
            <button type="button" className="btn sec" onClick={() => navigate("/")}>
              Übersicht
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = QUESTIONS_BY_ID[cards.ids[cards.idx]];

  return (
    <div className="view">
      <div className="learn-head">
        <button type="button" className="btn ghost sm" onClick={() => navigate("/")}>
          ← Beenden
        </button>
        <b>Karteikarten</b>
        <div className="prog">
          <i style={{ width: `${(cards.idx / cards.ids.length) * 100}%` }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink2)" }}>
          {cards.idx + 1}/{cards.ids.length}
        </span>
      </div>
      <div className="fc-wrap">
        <div className={`fc${cards.flipped ? " flip" : ""}`} onClick={flip}>
          <div className="face front">
            <div className="top-l">
              FRAGE {question.i} · {CATEGORIES[question.c].de}
            </div>
            <div className="body">
              <div className="qt">{question.q}</div>
              {store.cfg.en && <div className="en">{question.eq}</div>}
              <QuestionImage question={question} />
            </div>
            <div className="tap">
              Antippen oder <span className="kbd">Leertaste</span> zum Aufdecken
            </div>
          </div>
          <div className="face back">
            <div className="top-l">ANTWORT</div>
            <div className="body">
              <div className="ans">{question.a[question.k]}</div>
              {store.cfg.en && <div className="en">{question.ea[question.k]}</div>}
              <div style={{ marginTop: 14, fontSize: 13, color: "var(--mute)", fontWeight: 600 }}>
                Frage: {question.q}
              </div>
            </div>
            <div className="tap">Wusstest du es?</div>
          </div>
        </div>
        {cards.flipped && (
          <AnswerInfo question={question} english={store.cfg.en} defaultOpen />
        )}
        <div className="fc-acts">
          <button
            type="button"
            className={`btn no${cards.flipped ? "" : " hidden"}`}
            onClick={() => rate(false)}
          >
            ✗ Nicht gewusst <span className="kbd" style={{ color: "inherit", borderColor: "currentColor" }}>1</span>
          </button>
          <button
            type="button"
            className={`btn yes${cards.flipped ? "" : " hidden"}`}
            onClick={() => rate(true)}
          >
            ✓ Gewusst <span className="kbd" style={{ color: "inherit", borderColor: "currentColor" }}>2</span>
          </button>
        </div>
      </div>
    </div>
  );
}

import { useCallback } from "react";
import { Navigate, useNavigate } from "react-router";
import { HighlightedText } from "@/components/vocab/HighlightedText";
import { VOCAB_BY_ID, VOCAB_TOPICS } from "@/data/vocabulary";
import { useProgress } from "@/context/ProgressContext";
import { useSession } from "@/context/SessionContext";
import { useKeyboard } from "@/hooks/useKeyboard";
import { vocabExample, vocabNeedle } from "@/lib/vocab";

export function VocabSessionPage() {
  const navigate = useNavigate();
  const { store, markVocab } = useProgress();
  const { vocab, setVocab, startVocab } = useSession();

  const flip = useCallback(() => {
    if (!vocab || vocab.flipped || vocab.kind === "quiz") return;
    setVocab({ ...vocab, flipped: true });
  }, [setVocab, vocab]);

  const rate = useCallback(
    (ok: boolean) => {
      if (!vocab || (vocab.kind === "cards" && !vocab.flipped)) return;
      if (vocab.kind === "quiz" && vocab.picked == null) return;
      const id = vocab.ids[vocab.idx];
      markVocab(id, ok);
      setVocab({
        ...vocab,
        idx: vocab.idx + 1,
        ok: vocab.ok + (ok ? 1 : 0),
        ko: vocab.ko + (ok ? 0 : 1),
        flipped: false,
        picked: null,
      });
    },
    [markVocab, setVocab, vocab],
  );

  const pick = useCallback(
    (index: number) => {
      if (!vocab || vocab.kind !== "quiz" || vocab.picked != null) return;
      setVocab({ ...vocab, picked: index, flipped: true });
    },
    [setVocab, vocab],
  );

  useKeyboard(
    useCallback(
      (event: KeyboardEvent) => {
        if (!vocab) return;
        if (vocab.kind === "cards") {
          if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            if (!vocab.flipped) flip();
            else rate(true);
          } else if (event.key === "1") rate(false);
          else if (event.key === "2") rate(true);
        } else if (event.key >= "1" && event.key <= "4" && vocab.picked == null) {
          pick(Number(event.key) - 1);
        } else if (event.key === "Enter" && vocab.picked != null) {
          const id = vocab.ids[vocab.idx];
          rate(vocab.picked === vocab.choices[id].k);
        }
      },
      [flip, pick, rate, vocab],
    ),
  );

  if (!vocab) return <Navigate to="/vocab" replace />;

  if (vocab.idx >= vocab.ids.length) {
    return (
      <div className="view">
        <div className="q done">
          <div className="big">
            {vocab.ok}/{vocab.ids.length}
          </div>
          <div className="sub">gewusst · {vocab.ko} noch unsicher</div>
          <div className="pill-row">
            <button type="button" className="btn gold" onClick={() => startVocab({ mode: "smart", n: 20, kind: vocab.kind })}>
              Noch eine Runde
            </button>
            <button type="button" className="btn sec" onClick={() => navigate("/vocab")}>
              Alle Wörter
            </button>
          </div>
        </div>
      </div>
    );
  }

  const entry = VOCAB_BY_ID[vocab.ids[vocab.idx]];
  const example = vocabExample(entry);
  const needle = vocabNeedle(entry);
  const choice = vocab.choices[entry.id];

  return (
    <div className="view">
      <div className="learn-head">
        <button type="button" className="btn ghost sm" onClick={() => navigate("/vocab")}>
          ← Beenden
        </button>
        <b>{vocab.kind === "quiz" ? "Bedeutungstest" : "Wortkarten"}</b>
        <div className="prog">
          <i style={{ width: `${(vocab.idx / vocab.ids.length) * 100}%` }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink2)" }}>
          {vocab.idx + 1}/{vocab.ids.length}
        </span>
      </div>

      {vocab.kind === "cards" ? (
        <>
          <div className="fc-wrap">
            <div className={`fc${vocab.flipped ? " flip" : ""}`} onClick={flip}>
              <div className="face front">
                <div className="top-l">
                  {VOCAB_TOPICS[entry.topic].de.toUpperCase()} · {labelPos(entry.pos)}
                </div>
                <div className="body">
                  <div className="vocab-word">{entry.word}</div>
                  {entry.forms && <div className="vocab-forms">{entry.forms}</div>}
                  <div className="vocab-ex">
                    <div className="l">So steht es in der Prüfung</div>
                    <p>
                      <HighlightedText text={example.de} needle={needle} />
                    </p>
                  </div>
                </div>
                <div className="tap">
                  Bedeutung sagen, dann antippen oder <span className="kbd">Leertaste</span>
                </div>
              </div>
              <div className="face back">
                <div className="top-l">BEDEUTUNG</div>
                <div className="body">
                  <div className="ans">{entry.en}</div>
                  {entry.hint && <p className="vocab-hint">{entry.hint}</p>}
                  {store.cfg.en && (
                    <div className="vocab-ex">
                      <div className="l">Englisch</div>
                      <p className="en" style={{ margin: 0 }}>
                        {example.en}
                      </p>
                    </div>
                  )}
                </div>
                <div className="tap">Wusstest du es?</div>
              </div>
            </div>
          </div>
          <div className="fc-acts">
            <button type="button" className={`btn no${vocab.flipped ? "" : " hidden"}`} onClick={() => rate(false)}>
              ✗ Nicht gewusst <span className="kbd" style={{ color: "inherit", borderColor: "currentColor" }}>1</span>
            </button>
            <button type="button" className={`btn yes${vocab.flipped ? "" : " hidden"}`} onClick={() => rate(true)}>
              ✓ Gewusst <span className="kbd" style={{ color: "inherit", borderColor: "currentColor" }}>2</span>
            </button>
          </div>
        </>
      ) : (
        <div className="q">
          <div className="meta">
            <span>{VOCAB_TOPICS[entry.topic].de}</span>
            <span className="catlbl">{labelPos(entry.pos)}</span>
          </div>
          <p className="qt vocab-word" style={{ fontSize: 28 }}>
            {entry.word}
          </p>
          {entry.forms && <div className="vocab-forms">{entry.forms}</div>}
          <div className="vocab-ex">
            <div className="l">Im Test</div>
            <p>
              <HighlightedText text={example.de} needle={needle} />
            </p>
          </div>
          <div className="opts">
            {choice.options.map((option, index) => {
              const classes = ["opt"];
              if (vocab.picked != null) {
                if (index === choice.k) classes.push("right");
                else if (index === vocab.picked) classes.push("wrong");
                else classes.push("dim");
              }
              return (
                <button
                  key={`${index}-${option}`}
                  type="button"
                  className={classes.join(" ")}
                  disabled={vocab.picked != null}
                  onClick={() => pick(index)}
                >
                  <span className="k">{index + 1}</span>
                  <span className="txt">{option}</span>
                </button>
              );
            })}
          </div>
          {vocab.picked != null && (
            <div className={`fb ${vocab.picked === choice.k ? "ok" : "no"}`}>
              {vocab.picked === choice.k ? "✓ Richtig" : `✗ ${entry.en}`}
              {entry.hint ? <span className="grow" /> : null}
              {entry.hint && <span style={{ fontWeight: 600, fontSize: 13 }}>{entry.hint}</span>}
            </div>
          )}
          <div className="q-foot">
            <span className="hint">
              Tasten <span className="kbd">1</span>–<span className="kbd">4</span>
            </span>
            {vocab.picked != null && (
              <button type="button" className="btn" onClick={() => rate(vocab.picked === choice.k)}>
                Weiter →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function labelPos(pos: string) {
  return { noun: "Nomen", verb: "Verb", adj: "Adjektiv", phrase: "Wendung" }[pos] ?? pos;
}

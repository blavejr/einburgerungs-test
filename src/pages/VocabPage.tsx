import { useMemo, useState } from "react";
import { ChipGroup } from "@/components/ui/ChipGroup";
import { HighlightedText } from "@/components/vocab/HighlightedText";
import { VOCABULARY, VOCAB_TOPIC_ORDER, VOCAB_TOPICS, TOTAL_VOCAB } from "@/data/vocabulary";
import { useProgress } from "@/context/ProgressContext";
import { useSession } from "@/context/SessionContext";
import { useToast } from "@/context/ToastContext";
import { vocabExample, vocabNeedle, vocabStats } from "@/lib/vocab";
import type { VocabMode, VocabTopic } from "@/types";

const MODES: { value: VocabMode; label: string }[] = [
  { value: "smart", label: "Kluge Wiederholung" },
  { value: "wrong", label: "Nur unsichere" },
  { value: "new", label: "Nur neue" },
  { value: "random", label: "Zufällig" },
];

export function VocabPage() {
  const { store } = useProgress();
  const { startVocab, startLearn } = useSession();
  const { toast } = useToast();
  const stats = vocabStats(store);
  const [mode, setMode] = useState<VocabMode>("smart");
  const [topic, setTopic] = useState<VocabTopic | "">("");
  const [n, setN] = useState(20);
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const list = useMemo(() => {
    const needle = query.toLowerCase();
    return VOCABULARY.filter((entry) => {
      if (topic && entry.topic !== topic) return false;
      if (!needle) return true;
      const example = vocabExample(entry);
      return `${entry.word} ${entry.form} ${entry.en} ${entry.hint ?? ""} ${example.de} ${example.en}`
        .toLowerCase()
        .includes(needle);
    });
  }, [query, topic]);

  return (
    <div className="view">
      <h1>Wortschatz</h1>
      <p className="lead">
        Schwere Wörter aus den echten Prüfungsfragen – für B1. Ein Wort wie <b>vertritt</b> oder{" "}
        <b>Urteil</b> kann die ganze Frage kippen. Hier siehst du die einfache Bedeutung und den
        Satz aus dem Test.
      </p>

      <div className="numbers">
        <div className="num">
          <div className="v">
            {stats.seen}
            <span style={{ fontSize: 15, color: "var(--mute)" }}>/{TOTAL_VOCAB}</span>
          </div>
          <div className="l">Wörter gesehen</div>
        </div>
        <div className="num">
          <div className="v">{stats.mastered}</div>
          <div className="l">sitzen schon</div>
        </div>
        <div className="num">
          <div className="v" style={{ color: stats.waiting ? "var(--red)" : "var(--green)" }}>
            {stats.waiting}
          </div>
          <div className="l">fällig oder unsicher</div>
        </div>
        <div className="num">
          <div className="v">{stats.wrong}</div>
          <div className="l">zuletzt nicht gewusst</div>
        </div>
      </div>

      <div className="setup" style={{ maxWidth: "none", margin: "22px 0 0" }}>
        <div className="card">
          <div className="grp">
            <div className="l">Wie üben?</div>
            <ChipGroup options={MODES} value={mode} onChange={setMode} />
          </div>
          <div className="grp">
            <div className="l">Thema</div>
            <ChipGroup
              options={[
                { value: "" as const, label: "Alle" },
                ...VOCAB_TOPIC_ORDER.map((id) => ({ value: id, label: VOCAB_TOPICS[id].de })),
              ]}
              value={topic}
              onChange={setTopic}
            />
          </div>
          <div className="grp">
            <div className="l">Anzahl</div>
            <ChipGroup
              options={[
                { value: 10, label: "10" },
                { value: 20, label: "20" },
                { value: 40, label: "40" },
                { value: 999, label: "alle" },
              ]}
              value={n}
              onChange={setN}
            />
          </div>
          <div className="row" style={{ marginTop: 8 }}>
            <button type="button" className="btn gold" onClick={() => startVocab({ mode, topic, n, kind: "cards" })}>
              Karten
            </button>
            <button type="button" className="btn" onClick={() => startVocab({ mode, topic, n, kind: "quiz" })}>
              Bedeutungstest
            </button>
            <span className="hint" style={{ fontSize: 13, color: "var(--mute)", fontWeight: 600 }}>
              Karten: selbst sagen. Test: 4 englische Bedeutungen.
            </span>
          </div>
        </div>
      </div>

      <h2>Nachschlagen</h2>
      <div className="filters">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Wort suchen (Deutsch oder Englisch)…"
        />
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--mute)" }}>
          {list.length} Wörter
        </span>
      </div>
      <div className="list">
        {list.length ? (
          list.map((entry) => {
            const record = store.v[entry.id];
            const open = openId === entry.id;
            const example = vocabExample(entry);
            const color = record?.seen ? (record.last === "w" ? "var(--red)" : "var(--green)") : "#D9DCE2";
            return (
              <div className="item vocab-item" key={entry.id}>
                <button type="button" className="vocab-row" onClick={() => setOpenId(open ? null : entry.id)}>
                  <span className="st" style={{ background: color }} />
                  <div className="grow">
                    <div className="qt">{entry.word}</div>
                    <div className="en">{entry.en}</div>
                  </div>
                  <span className="chip">{VOCAB_TOPICS[entry.topic].de}</span>
                </button>
                {open && (
                  <div className="vocab-detail">
                    <div className="vocab-meta">
                      {entry.pos === "noun" && entry.gender && (
                        <span>{entry.gender === "m" ? "maskulin" : entry.gender === "f" ? "feminin" : "neutral"}</span>
                      )}
                      {entry.plural && <span>Plural: {entry.plural}</span>}
                      {entry.forms && <span>{entry.forms}</span>}
                      {entry.pos === "verb" && <span>Verb</span>}
                    </div>
                    {entry.hint && <p className="vocab-hint">{entry.hint}</p>}
                    <div className="vocab-ex">
                      <div className="l">Im Test</div>
                      <p>
                        <HighlightedText text={example.de} needle={vocabNeedle(entry)} />
                      </p>
                      {store.cfg.en && <p className="en">{example.en}</p>}
                    </div>
                    <div className="acts" style={{ marginTop: 10, display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        className="btn sm sec"
                        onClick={() => startVocab({ ids: [entry.id], kind: "cards" })}
                      >
                        Diese Karte
                      </button>
                      <button
                        type="button"
                        className="btn sm ghost"
                        onClick={() => {
                          if (!startLearn({ mode: "single", ids: [entry.q] })) {
                            toast("Frage nicht gefunden");
                          }
                        }}
                      >
                        Zur Frage {entry.q}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="card" style={{ color: "var(--mute)", fontWeight: 600 }}>
            Nichts gefunden.
          </div>
        )}
      </div>
    </div>
  );
}

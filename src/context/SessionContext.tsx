import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { useProgress } from "@/context/ProgressContext";
import { useToast } from "@/context/ToastContext";
import { TEST_SECONDS } from "@/data/constants";
import { QUESTIONS_BY_ID } from "@/data/questions";
import { learnTitle, pickCardIds, pickLearnIds } from "@/lib/queue";
import { createOfficialTestIds, scoreTest } from "@/lib/test";
import { buildQuizChoices, pickVocabIds } from "@/lib/vocab";
import type {
  CardsOptions,
  CardsSession,
  LearnOptions,
  LearnSession,
  TestSession,
  VocabOptions,
  VocabSession,
} from "@/types";

interface SessionContextValue {
  learn: LearnSession | null;
  cards: CardsSession | null;
  test: TestSession | null;
  vocab: VocabSession | null;
  startLearn: (options: LearnOptions) => boolean;
  startCards: (options?: CardsOptions) => boolean;
  startTest: () => void;
  startVocab: (options?: VocabOptions) => boolean;
  setLearn: (session: LearnSession | null | ((prev: LearnSession | null) => LearnSession | null)) => void;
  setCards: (session: CardsSession | null | ((prev: CardsSession | null) => CardsSession | null)) => void;
  setTest: (session: TestSession | null | ((prev: TestSession | null) => TestSession | null)) => void;
  setVocab: (session: VocabSession | null | ((prev: VocabSession | null) => VocabSession | null)) => void;
  finishTest: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

function sessionId() {
  if (typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch {
      // http:// LAN IPs are not a secure context
    }
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { store, mark, addTest } = useProgress();
  const { toast } = useToast();
  const [learn, setLearn] = useState<LearnSession | null>(null);
  const [cards, setCards] = useState<CardsSession | null>(null);
  const [test, setTest] = useState<TestSession | null>(null);
  const [vocab, setVocab] = useState<VocabSession | null>(null);

  const startLearn = useCallback(
    (options: LearnOptions) => {
      const queue = pickLearnIds(store, options);
      if (!queue.length) {
        toast("Keine passenden Fragen");
        return false;
      }
      setLearn({
        id: sessionId(),
        queue,
        idx: 0,
        answered: 0,
        ok: 0,
        wrongIds: [],
        title: learnTitle(options),
        total: queue.length,
        retryIds: [],
      });
      navigate("/learn/session");
      return true;
    },
    [navigate, store, toast],
  );

  const startCards = useCallback(
    (options: CardsOptions = {}) => {
      const ids = pickCardIds(store, options);
      if (!ids.length) {
        toast("Keine passenden Karten");
        return false;
      }
      setCards({ id: sessionId(), ids, idx: 0, ok: 0, ko: 0, flipped: false });
      navigate("/cards/session");
      return true;
    },
    [navigate, store, toast],
  );

  const startVocab = useCallback(
    (options: VocabOptions = {}) => {
      const ids = pickVocabIds(store, options);
      if (!ids.length) {
        toast("Keine passenden Wörter");
        return false;
      }
      setVocab({
        id: sessionId(),
        ids,
        idx: 0,
        ok: 0,
        ko: 0,
        flipped: false,
        kind: options.kind ?? "cards",
        choices: options.kind === "quiz" ? buildQuizChoices(ids) : {},
        picked: null,
      });
      navigate("/vocab/session");
      return true;
    },
    [navigate, store, toast],
  );

  const startTest = useCallback(() => {
    setTest({
      id: sessionId(),
      ids: createOfficialTestIds(),
      ans: {},
      idx: 0,
      start: Date.now(),
      secs: TEST_SECONDS,
    });
    navigate("/test/run");
  }, [navigate]);

  const finishTest = useCallback(() => {
    if (!test || test.done) return;
    const score = scoreTest(test.ids, test.ans);
    test.ids.forEach((id) => {
      mark(id, test.ans[id] === QUESTIONS_BY_ID[id].k);
    });
    addTest({
      at: Date.now(),
      score,
      secs: Math.floor((Date.now() - test.start) / 1000),
    });
    setTest({ ...test, score, done: true, endedAt: Date.now() });
    navigate("/test/result");
  }, [addTest, mark, navigate, test]);

  const value = useMemo(
    () => ({
      learn,
      cards,
      test,
      vocab,
      startLearn,
      startCards,
      startTest,
      startVocab,
      setLearn,
      setCards,
      setTest,
      setVocab,
      finishTest,
    }),
    [learn, cards, test, vocab, startLearn, startCards, startTest, startVocab, finishTest],
  );

  return <SessionContext value={value}>{children}</SessionContext>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}

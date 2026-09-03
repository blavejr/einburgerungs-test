import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from "react";
import { useToast } from "@/context/ToastContext";
import { applyMark, applyVocabMark } from "@/lib/progress";
import { createEmptyStore, isAppStore, loadStore, normalizeStore, saveStore } from "@/lib/storage";
import type { AppConfig, AppStore, TestHistoryEntry } from "@/types";

type Action =
  | { type: "mark"; id: number; correct: boolean }
  | { type: "markVocab"; id: string; correct: boolean }
  | { type: "setCfg"; cfg: Partial<AppConfig> }
  | { type: "addTest"; result: TestHistoryEntry }
  | { type: "replace"; store: AppStore }
  | { type: "reset" };

interface ProgressContextValue {
  store: AppStore;
  mark: (id: number, correct: boolean) => void;
  markVocab: (id: string, correct: boolean) => void;
  setCfg: (cfg: Partial<AppConfig>) => void;
  addTest: (result: TestHistoryEntry) => void;
  importStore: (raw: unknown) => boolean;
  reset: () => void;
  exportJson: () => string;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

function reducer(state: AppStore, action: Action): AppStore {
  switch (action.type) {
    case "mark":
      return applyMark(state, action.id, action.correct);
    case "markVocab":
      return applyVocabMark(state, action.id, action.correct);
    case "setCfg":
      return { ...state, cfg: { ...state.cfg, ...action.cfg } };
    case "addTest":
      return { ...state, tests: [...state.tests, action.result] };
    case "replace":
      return normalizeStore(action.store);
    case "reset":
      return { ...createEmptyStore(), cfg: state.cfg };
  }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [store, dispatch] = useReducer(reducer, undefined, loadStore);
  const skipPersist = useRef(true);

  useEffect(() => {
    if (skipPersist.current) {
      skipPersist.current = false;
      return;
    }
    if (!saveStore(store)) {
      toast("Speichern nicht möglich – Fortschritt gilt nur für diese Sitzung");
    }
  }, [store, toast]);

  const mark = useCallback((id: number, correct: boolean) => {
    dispatch({ type: "mark", id, correct });
  }, []);

  const markVocab = useCallback((id: string, correct: boolean) => {
    dispatch({ type: "markVocab", id, correct });
  }, []);

  const setCfg = useCallback((cfg: Partial<AppConfig>) => {
    dispatch({ type: "setCfg", cfg });
  }, []);

  const addTest = useCallback((result: TestHistoryEntry) => {
    dispatch({ type: "addTest", result });
  }, []);

  const importStore = useCallback((raw: unknown) => {
    if (!isAppStore(raw)) return false;
    dispatch({ type: "replace", store: raw });
    return true;
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "reset" });
  }, []);

  const exportJson = useCallback(() => JSON.stringify(store), [store]);

  const value = useMemo(
    () => ({ store, mark, markVocab, setCfg, addTest, importStore, reset, exportJson }),
    [store, mark, markVocab, setCfg, addTest, importStore, reset, exportJson],
  );

  return <ProgressContext value={value}>{children}</ProgressContext>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}

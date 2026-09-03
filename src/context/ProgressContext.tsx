import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { getProgressRequest, putProgressRequest } from "@/lib/api";
import { applyMark, applyVocabMark } from "@/lib/progress";
import { createEmptyStore, hasProgressData, isAppStore, loadStore, normalizeStore, saveStore } from "@/lib/storage";
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
  cloudSaving: boolean;
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
  const { user, ready: authReady } = useAuth();
  const [store, dispatch] = useReducer(reducer, undefined, loadStore);
  const [cloudSaving, setCloudSaving] = useState(false);
  const skipPersist = useRef(true);
  const skipCloud = useRef(false);
  const storeRef = useRef(store);
  const hydratedUser = useRef<string | null>(null);
  storeRef.current = store;

  useEffect(() => {
    if (skipPersist.current) {
      skipPersist.current = false;
      return;
    }
    if (!saveStore(store)) {
      toast("Speichern nicht möglich – Fortschritt gilt nur für diese Sitzung");
    }
  }, [store, toast]);

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      hydratedUser.current = null;
      return;
    }
    if (hydratedUser.current === user.id) return;
    let cancelled = false;
    (async () => {
      try {
        const remote = await getProgressRequest();
        if (cancelled) return;
        if (remote.store && hasProgressData(remote.store)) {
          skipCloud.current = true;
          skipPersist.current = false;
          dispatch({ type: "replace", store: remote.store });
          toast("Fortschritt aus der Cloud geladen");
        } else if (hasProgressData(storeRef.current)) {
          await putProgressRequest(storeRef.current);
          toast("Lokaler Stand in die Cloud gelegt");
        }
        hydratedUser.current = user.id;
      } catch (error) {
        toast(error instanceof Error ? error.message : "Cloud nicht erreichbar");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authReady, user, toast]);

  useEffect(() => {
    if (!user || hydratedUser.current !== user.id) return;
    if (skipCloud.current) {
      skipCloud.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      setCloudSaving(true);
      putProgressRequest(store)
        .catch((error) => {
          toast(error instanceof Error ? error.message : "Cloud-Speichern fehlgeschlagen");
        })
        .finally(() => setCloudSaving(false));
    }, 800);
    return () => window.clearTimeout(timer);
  }, [store, user, toast]);

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
    () => ({ store, cloudSaving, mark, markVocab, setCfg, addTest, importStore, reset, exportJson }),
    [store, cloudSaving, mark, markVocab, setCfg, addTest, importStore, reset, exportJson],
  );

  return <ProgressContext value={value}>{children}</ProgressContext>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}

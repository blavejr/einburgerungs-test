import { useCallback } from "react";
import { useProgress } from "@/context/ProgressContext";
import { useKeyboard } from "@/hooks/useKeyboard";

export function useEnglishHotkey() {
  const { store, setCfg } = useProgress();

  useKeyboard(
    useCallback(
      (event: KeyboardEvent) => {
        if (event.key.toLowerCase() === "e") setCfg({ en: !store.cfg.en });
      },
      [setCfg, store.cfg.en],
    ),
  );
}

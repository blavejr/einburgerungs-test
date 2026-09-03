import { useEffect } from "react";

export function useKeyboard(handler: ((event: KeyboardEvent) => void) | null) {
  useEffect(() => {
    if (!handler) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, select, textarea")) return;
      handler(event);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [handler]);
}

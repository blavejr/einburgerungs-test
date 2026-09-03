import { CATEGORIES } from "@/data/categories";
import { useProgress } from "@/context/ProgressContext";
import type { CategoryId } from "@/types";

export function CategoryLabel({ id }: { id: CategoryId }) {
  const { store } = useProgress();
  const category = CATEGORIES[id];

  return (
    <span className="catlbl">
      {category.de}
      {store.cfg.en && (
        <>
          {" · "}
          <span style={{ color: "var(--blue)" }}>{category.en}</span>
        </>
      )}
    </span>
  );
}

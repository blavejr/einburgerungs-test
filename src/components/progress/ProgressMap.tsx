import { CATEGORIES, CATEGORY_ORDER } from "@/data/categories";
import { QUESTIONS, QUESTIONS_BY_ID } from "@/data/questions";
import { useProgress } from "@/context/ProgressContext";
import { dotClass } from "@/lib/progress";

export function ProgressMap({ big = false, onSelect }: { big?: boolean; onSelect: (id: number) => void }) {
  const { store } = useProgress();

  return (
    <div className="map">
      {CATEGORY_ORDER.map((categoryId) => {
        const category = CATEGORIES[categoryId];
        const ids = QUESTIONS.filter((q) => q.c === categoryId).map((q) => q.i);
        return (
          <div className="map-cat" key={categoryId}>
            <div className="lbl">
              {category.de}
              <small>{category.en}</small>
            </div>
            <div className="dots">
              {ids.map((id) => (
                <button
                  key={id}
                  type="button"
                  className={`dot ${big ? "big " : ""}${dotClass(store, id)}`}
                  title={`Frage ${id}: ${QUESTIONS_BY_ID[id].q}`}
                  aria-label={`Frage ${id}`}
                  onClick={() => onSelect(id)}
                />
              ))}
            </div>
          </div>
        );
      })}
      <div className="legend">
        <span>
          <i style={{ background: "#D9DCE2" }} />
          noch nie
        </span>
        <span>
          <i style={{ background: "var(--gold)" }} />
          warm – noch unsicher
        </span>
        <span>
          <i style={{ background: "var(--red)" }} />
          zuletzt falsch
        </span>
        <span>
          <i style={{ background: "#EDA39F" }} />
          falsch, länger her
        </span>
        <span>
          <i style={{ background: "#A9E3C3" }} />
          1× richtig
        </span>
        <span>
          <i style={{ background: "var(--green)" }} />
          4× in Folge
        </span>
        <span>
          <i style={{ background: "var(--green-deep)" }} />
          5× – sitzt
        </span>
        <span>
          <i style={{ background: "#fff", boxShadow: "0 0 0 2px var(--gold)" }} />
          heute geübt
        </span>
      </div>
    </div>
  );
}

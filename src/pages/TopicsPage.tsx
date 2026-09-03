import { Link } from "react-router";
import { CATEGORIES, CATEGORY_ORDER } from "@/data/categories";
import { useProgress } from "@/context/ProgressContext";
import { useSession } from "@/context/SessionContext";
import { categoryBreakdown } from "@/lib/stats";

export function TopicsPage() {
  const { store } = useProgress();
  const { startLearn } = useSession();
  const english = store.cfg.en;

  return (
    <div className="view">
      <h1>Themen</h1>
      <p className="lead">
        Ein Thema üben oder die Fragenliste öffnen.
        {english && <span className="en-lead">Practice one topic, or open its question list.</span>}
      </p>
      <div className="topics">
        {CATEGORY_ORDER.map((id) => {
          const category = CATEGORIES[id];
          const breakdown = categoryBreakdown(store, id);
          const total = breakdown.ids.length;
          return (
            <div className="topic" key={id}>
              <button type="button" className="topic-main" onClick={() => startLearn({ mode: "cat", cat: id, n: 999 })}>
                <span className="t">{category.de}</span>
                <span className="s">
                  {english ? `${category.en} · ` : ""}
                  {breakdown.mastered}/{total} sicher
                  {breakdown.wrong ? ` · ${breakdown.wrong} falsch` : ""}
                </span>
                <span className="bar">
                  <i className="g" style={{ width: `${(breakdown.mastered / total) * 100}%` }} />
                  <i className="y" style={{ width: `${(breakdown.learning / total) * 100}%` }} />
                  <i className="r" style={{ width: `${(breakdown.wrong / total) * 100}%` }} />
                </span>
              </button>
              <Link to={`/browse?cat=${id}`} className="topic-list">
                Liste
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

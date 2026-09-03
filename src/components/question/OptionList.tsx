import type { Question } from "@/types";

export function OptionList({
  question,
  english,
  selected = null,
  disabled = false,
  reveal = false,
  onSelect,
}: {
  question: Question;
  english: boolean;
  selected?: number | null;
  disabled?: boolean;
  reveal?: boolean;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="opts">
      {question.a.map((answer, index) => {
        const classes = ["opt"];
        if (reveal) {
          if (index === question.k) classes.push("right");
          else if (index === selected) classes.push("wrong");
          else classes.push("dim");
        } else if (selected === index) {
          classes.push("sel");
        }

        return (
          <button
            key={index}
            type="button"
            className={classes.join(" ")}
            disabled={disabled}
            onClick={() => onSelect(index)}
          >
            <span className="k">{index + 1}</span>
            <span className="txt">
              {answer}
              {english && <span className="en">{question.ea[index]}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

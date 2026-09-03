export interface ChipOption<T extends string | number> {
  value: T;
  label: string;
}

export function ChipGroup<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: readonly ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="chips">
      {options.map((option) => (
        <button
          key={`${option.value}-${option.label}`}
          type="button"
          className={`chip${option.value === value ? " on" : ""}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

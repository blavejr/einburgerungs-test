const RADIUS = 18;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function GoalRing({ percent }: { percent: number }) {
  const offset = CIRCUMFERENCE * (1 - Math.min(100, percent) / 100);
  return (
    <svg className="ring" viewBox="0 0 44 44" aria-hidden="true">
      <circle className="bg" cx="22" cy="22" r={RADIUS} />
      <circle
        className="fg"
        cx="22"
        cy="22"
        r={RADIUS}
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        transform="rotate(-90 22 22)"
      />
    </svg>
  );
}

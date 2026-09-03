import { highlightParts } from "@/lib/vocab";

export function HighlightedText({ text, needle }: { text: string; needle: string }) {
  const parts = highlightParts(text, needle);
  if (!parts) return <>{text}</>;
  return (
    <>
      {parts.before}
      <mark>{parts.match}</mark>
      {parts.after}
    </>
  );
}

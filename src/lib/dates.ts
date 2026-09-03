import { DAY_MS } from "@/data/constants";

export function todayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function daysToExam(exam: string): number {
  const examDate = new Date(`${exam}T00:00:00`);
  const today = new Date(`${todayKey()}T00:00:00`);
  return Math.ceil((examDate.getTime() - today.getTime()) / DAY_MS);
}

export function formatTimer(seconds: number): string {
  const s = Math.max(0, seconds);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

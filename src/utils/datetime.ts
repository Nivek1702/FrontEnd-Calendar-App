import type { DateTimeVO } from "../types";

export function toVO(date: Date, hhmm: string): DateTimeVO {
  const [hh, mm] = hhmm.split(":").map((x) => parseInt(x, 10));
  return {
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
    hour: hh ?? 0,
    minute: mm ?? 0,
  };
}

export function formatRangeLabel(start: string, end: string) {
  return `${start}–${end}`;
}

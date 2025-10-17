// src/utils/calendar-id.ts
export function calendarIdFromDate(d: Date): number {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return Number(`${y}${m}${day}`); // 20251016
}

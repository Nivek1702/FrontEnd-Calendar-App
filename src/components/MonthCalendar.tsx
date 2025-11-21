// src/components/MonthCalendar.tsx
import Calendar from "react-calendar";
import type { DayEvent, UserCalendar } from "../types/calendar";
import { formatRangeLabel } from "../utils/datetime";
import "../index.css";
import "../css/CalendarioNav.css";

interface MonthCalendarProps {
  date: Date;
  onChangeDate: (d: Date) => void;
  eventsMap: Map<string, DayEvent[]>;
  calendars: UserCalendar[];
  visibleCalendarIds: Set<number>;
  onClickDay: (date: Date) => void;
  onClickEvent: (event: DayEvent, dateKey: string, date: Date) => void;
}

export default function MonthCalendar({
  date,
  onChangeDate,
  eventsMap,
  calendars,
  visibleCalendarIds,
  onClickDay,
  onClickEvent,
}: MonthCalendarProps) {
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return null;

    const key = date.toISOString().slice(0, 10);
    let items = eventsMap.get(key) || [];

    // filtrar por calendarios visibles
    items = items.filter((e) => visibleCalendarIds.has(e.calendarId));

    if (items.length === 0) return null;

    return (
      <div
        className="mt-1"
        style={{ display: "flex", flexDirection: "column", gap: 6 }}
      >
        {items.slice(0, 3).map((e) => {
          const cal = calendars.find((c) => c.id === e.calendarId);
          const color = cal?.color ?? "#eef6ff";

          return (
            <div
              key={e.id}
              className="cal-event"
              style={{
                backgroundColor: color,
                borderColor: color,
                cursor: "pointer",
                maxWidth: "100%",
                overflow: "hidden",
                borderRadius: 10,
              }}
              onClick={(ev) => {
                ev.stopPropagation();
                onClickEvent(e, key, date);
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {e.title}
              </div>
              <div
                style={{
                  fontSize: "0.78rem",
                  opacity: 0.8,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {formatRangeLabel(e.startTime, e.endTime)}
              </div>
            </div>
          );
        })}
        {items.length > 3 && (
          <div
            style={{
              fontSize: "0.78rem",
              opacity: 0.7,
              textAlign: "center",
            }}
          >
            +{items.length - 3} más
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="calendar-main">
      <Calendar
        value={date}
        onChange={(v) => onChangeDate(v as Date)}
        tileContent={tileContent}
        onClickDay={onClickDay}
      />
    </main>
  );
}

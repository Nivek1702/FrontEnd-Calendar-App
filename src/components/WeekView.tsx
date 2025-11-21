// src/components/WeekView.tsx
import "../css/WeekView.css";

type UserCalendar = {
  id: number;
  name: string;
  description: string;
  color: string;
};

export type WeekEvent = {
  id: number;
  calendarId: number;
  title: string;
  date: string;      // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
};

type WeekViewProps = {
  weekDays: Date[];
  events: WeekEvent[];
  calendars: UserCalendar[];
  // Click en un bloque horario
  onSlotClick?: (args: { date: string; hour: number }) => void;
  // Click en un evento (para editar)
  onEventClick?: (event: WeekEvent) => void;
};

const DAY_START_HOUR = 7;   // 7:00
const DAY_END_HOUR = 22;    // 22:00 (el bloque 21–22 es el último)

// Horas enteras: 7,8,...,21 (cada una representa [h, h+1) )
const HOURS: number[] = Array.from(
  { length: DAY_END_HOUR - DAY_START_HOUR },
  (_, i) => DAY_START_HOUR + i
);

export default function WeekView({
  weekDays,
  events,
  calendars,
  onSlotClick,
  onEventClick,
}: WeekViewProps) {
  const daysLabels = weekDays.map((d) => {
    const dow = d.toLocaleDateString("es-PE", { weekday: "short" });
    const dayNum = d.getDate();
    return { label: dow, num: dayNum, dateKey: d.toISOString().slice(0, 10) };
  });

  // 👉 clave de la fecha de hoy (YYYY-MM-DD) para resaltar el día actual
  const todayKey = new Date().toISOString().slice(0, 10);

  return (
    <div className="week-view">
      {/* Cabecera con días */}
      <div className="week-view-header">
        <div className="week-view-header-hour-col" />
        {daysLabels.map((d) => (
          <div
            key={d.dateKey}
            className={
              "week-view-header-day" +
              (d.dateKey === todayKey ? " week-view-header-day--today" : "")
            }
          >
            <div className="week-view-header-day-name">{d.label}</div>
            <div className="week-view-header-day-num">{d.num}</div>
          </div>
        ))}
      </div>

      {/* Cuerpo grilla */}
      <div className="week-view-body">
        {/* Columna de horas */}
        <div className="week-view-hours">
          {HOURS.map((h) => (
            <div key={h} className="week-view-hour-slot">
              <span>{`${String(h).padStart(2, "0")}:00`}</span>
            </div>
          ))}
        </div>

        {/* Columnas de días */}
        <div className="week-view-days">
          {daysLabels.map((d) => (
            <div
              key={d.dateKey}
              className={
                "week-view-day-column" +
                (d.dateKey === todayKey ? " week-view-day-column--today" : "")
              }
            >
              <div className="week-view-day-inner">
                {HOURS.map((hour) => {
                  const hourPrefix = `${String(hour).padStart(2, "0")}:`;
                  const slotEvents = events.filter(
                    (e) =>
                      e.date === d.dateKey &&
                      e.startTime.startsWith(hourPrefix)
                  );

                  return (
                    <div
                      key={hour}
                      className="week-view-day-hour-slot"
                      onClick={() =>
                        onSlotClick?.({ date: d.dateKey, hour })
                      }
                    >
                      {slotEvents.map((e) => {
                        const cal = calendars.find(
                          (c) => c.id === e.calendarId
                        );
                        const color = cal?.color ?? "#1a73e8";

                        return (
                          <div
                            key={e.id}
                            className="week-view-event"
                            style={{
                              backgroundColor: color,
                              borderColor: color,
                            }}
                            onClick={(ev) => {
                              ev.stopPropagation(); // que no dispare el click del slot
                              onEventClick?.(e);
                            }}
                          >
                            <div className="week-view-event-title">
                              {e.title}
                            </div>
                            <div className="week-view-event-time">
                              {e.startTime} – {e.endTime}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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
  description?: string;
  location?: string;
};

type WeekViewProps = {
  weekDays: Date[];
  events: WeekEvent[];
  calendars: UserCalendar[];
  // Click en un bloque horario
  onSlotClick?: (args: { date: string; hour: number }) => void;
  // Click en un evento (para editar)
  onEventClick?: (event: WeekEvent) => void;
  // Navegación de semanas
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
};

const DAY_START_HOUR = 7;   // 07:00
const DAY_END_HOUR = 23;    // último label: 22:00 (slot [22,23))
const SLOT_HEIGHT = 80;     // altura de 1 hora (en px) – debe coincidir con el CSS

// Horas enteras: 7,8,...,22 (cada una representa [h, h+1) )
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
  onPrevWeek,
  onNextWeek,
}: WeekViewProps) {
  const daysLabels = weekDays.map((d) => {
    const dow = d.toLocaleDateString("es-PE", { weekday: "short" });
    const dayNum = d.getDate();
    return { label: dow, num: dayNum, dateKey: d.toISOString().slice(0, 10) };
  });

  // clave de la fecha de hoy (YYYY-MM-DD) para resaltar el día actual
  const todayKey = new Date().toISOString().slice(0, 10);

  return (
    <div className="week-view">
      {/* Cabecera con días */}
      <div className="week-view-header">
        {/* Columna de horas (vacía, sólo alineación) */}
        <div className="week-view-header-hour-col" />

        {/* Flecha semana anterior (columna antes del lunes) */}
        <div className="week-view-header-arrow-cell">
          {onPrevWeek && (
            <button
              type="button"
              className="week-nav-arrow week-nav-arrow--left"
              onClick={onPrevWeek}
              aria-label="Semana anterior"
            >
              ◀
            </button>
          )}
        </div>

        {/* Días de la semana */}
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

        {/* Flecha semana siguiente (columna después del domingo) */}
        <div className="week-view-header-arrow-cell">
          {onNextWeek && (
            <button
              type="button"
              className="week-nav-arrow week-nav-arrow--right"
              onClick={onNextWeek}
              aria-label="Semana siguiente"
            >
              ▶
            </button>
          )}
        </div>
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
          {daysLabels.map((d) => {
            const dayEvents = events.filter((e) => e.date === d.dateKey);

            return (
              <div
                key={d.dateKey}
                className={
                  "week-view-day-column" +
                  (d.dateKey === todayKey ? " week-view-day-column--today" : "")
                }
              >
                <div className="week-view-day-inner">
                  {/* Slots de fondo clicables */}
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className="week-view-day-hour-slot"
                      onClick={() => onSlotClick?.({ date: d.dateKey, hour })}
                    />
                  ))}

                  {/* Eventos superpuestos */}
                  {dayEvents.map((e) => {
                    const [sh, sm] = e.startTime.split(":").map(Number);
                    const [eh, em] = e.endTime.split(":").map(Number);

                    const startFloat = sh + sm / 60;
                    let endFloat = eh + em / 60;

                    // Ajuste para que no se salga del rango visual
                    if (endFloat > DAY_END_HOUR) {
                      endFloat = DAY_END_HOUR;
                    }

                    let duration = endFloat - startFloat;
                    if (duration <= 0) {
                      duration = 0.25; // mínimo (15 min) para que se vea algo
                    }

                    const topPx = (startFloat - DAY_START_HOUR) * SLOT_HEIGHT;
                    const heightPx = duration * SLOT_HEIGHT;

                    const cal = calendars.find((c) => c.id === e.calendarId);
                    const color = cal?.color ?? "#1a73e8";

                    return (
                      <div
                        key={e.id}
                        className="week-view-event"
                        style={{
                          top: topPx,
                          height: heightPx - 6, // pequeño margen
                          backgroundColor: color,
                          borderColor: color,
                        }}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          onEventClick?.(e);
                        }}
                      >
                        <div className="week-view-event-title">{e.title}</div>
                        {e.description && (
                          <div className="week-view-event-extra">
                            {e.description}
                          </div>
                        )}
                        {e.location && (
                          <div className="week-view-event-extra">
                            {e.location}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

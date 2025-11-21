import type { UserCalendar } from "../types/calendar";

import "../css/Dashboard.css";

interface CalendarSidebarProps {
  calendars: UserCalendar[];
  visibleCalendarIds: Set<number>;
  onToggleCalendarVisibility: (id: number) => void;
  onNewCalendar: () => void;
  onOpenAddSchedule: () => void;
  onGenerateSchedule: () => void;
  onRequestDeleteCalendar: (calendar: UserCalendar) => void;
}

export default function CalendarSidebar({
  calendars,
  visibleCalendarIds,
  onToggleCalendarVisibility,
  onNewCalendar,
  onOpenAddSchedule,
  onGenerateSchedule,
  onRequestDeleteCalendar,
}: CalendarSidebarProps) {
  return (
    <aside className="calendar-sidebar">
      <h5 className="sidebar-title">Mis calendarios</h5>

      <ul className="calendar-list">
        {calendars.length === 0 && (
          <li className="calendar-list-empty">Aún no tienes calendarios</li>
        )}

        {calendars.map((cal) => {
          const checked = visibleCalendarIds.has(cal.id);
          return (
            <li
              key={cal.id}
              className={
                "calendar-list-item" +
                (checked ? "" : " calendar-list-item--disabled")
              }
            >
              <input
                type="checkbox"
                className="calendar-checkbox"
                checked={checked}
                onChange={() => onToggleCalendarVisibility(cal.id)}
              />
              <span
                className="calendar-color-dot"
                style={{ backgroundColor: cal.color }}
              />
              <span className="calendar-name" style={{ flex: 1 }}>
                {cal.name}
              </span>

              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={() => onRequestDeleteCalendar(cal)}
              >
                🗑
              </button>
            </li>
          );
        })}
      </ul>

      <button
        className="btn btn-outline-primary w-100 mt-3"
        onClick={onNewCalendar}
      >
        + Nuevo calendario
      </button>

      <div className="sidebar-actions">
        <button
          className="btn btn-primary w-100"
          onClick={onOpenAddSchedule}
        >
          Ingresar horario
        </button>
        <button
          className="btn btn-success w-100"
          onClick={onGenerateSchedule}
        >
          Generar horario
        </button>
      </div>
    </aside>
  );
}

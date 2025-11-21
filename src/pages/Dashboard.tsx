// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

// Vistas
import MonthCalendar from "../components/MonthCalendar";
import WeekView, { type WeekEvent } from "../components/Weekview";

// Tipos
import type { DayEvent, UserCalendar } from "../types/calendar";

// Modales / componentes
import AddScheduleModal from "../components/EventoModal";
import TopBar from "../components/TopBar";
import UserProfileModal from "./user-profile";
import CalendarioModal from "../components/CalendarioModal";
import EliminarCalendario from "../components/EliminarCalendario";
import CalendarSidebar from "../components/CalendarSideBar";

// CSS
import "../css/WeekView.css";
import "../css/Dashboard.css";

type EditableEvent = {
  timeId: number;
  eventId: number;
  calendarId: number;
  title: string;
  description: string;
  location: string;
  date: string;      // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
};

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // lunes = 0
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [value, setValue] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [eventsMap, setEventsMap] = useState<Map<string, DayEvent[]>>(
    new Map()
  );

  const [showModal, setShowModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showCreateCalendar, setShowCreateCalendar] = useState(false);

  // Mes / Semana
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [viewDropdownOpen, setViewDropdownOpen] = useState(false);

  const [calendars, setCalendars] = useState<UserCalendar[]>([]);
  const [visibleCalendarIds, setVisibleCalendarIds] = useState<Set<number>>(
    new Set()
  );

  const [editingEvent, setEditingEvent] = useState<EditableEvent | null>(null);

  const [calendarToDelete, setCalendarToDelete] =
    useState<UserCalendar | null>(null);
  const [showDeleteCalendar, setShowDeleteCalendar] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // ============= Cargar calendarios del usuario =============
  async function loadUserCalendars() {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Sesión expirada, vuelve a iniciar sesión");

      const { data } = await api.get<UserCalendar[]>(
        "/calendars/get_all_calendars/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCalendars(data);
      setVisibleCalendarIds(new Set(data.map((c) => c.id)));
    } catch (err) {
      console.error("Error cargando calendarios del usuario", err);
    }
  }

  // ============= Cargar eventos+times para el mes mostrado ============
  async function loadMonthData(viewDate: Date) {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Sesión expirada, vuelve a iniciar sesión");

      if (calendars.length === 0) {
        setEventsMap(new Map());
        return;
      }

      const y = viewDate.getFullYear();
      const m = viewDate.getMonth() + 1; // 1-12

      const authConfig = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const requests = calendars.map(async (cal) => {
        const { data } = await api.get(
          `/calendars/get_calendar_events_times/${cal.id}`,
          authConfig
        );
        return { calendar: cal, data };
      });

      const responses = await Promise.all(requests);
      const map = new Map<string, DayEvent[]>();

      for (const { data } of responses) {
        if (!data || !data.events_times) continue;

        for (const et of data.events_times) {
          const event = et.event;
          const times = et.times || [];

          for (const t of times) {
            const st = t.start_time;
            const en = t.end_time;

            // Solo eventos del mes/año visibles
            if (st.year !== y || st.month !== m) continue;

            const key = `${st.year}-${String(st.month).padStart(
              2,
              "0"
            )}-${String(st.day).padStart(2, "0")}`;

            const startTime = `${String(st.hour).padStart(2, "0")}:${String(
              st.minute
            ).padStart(2, "0")}`;
            const endTime = `${String(en.hour).padStart(2, "0")}:${String(
              en.minute
            ).padStart(2, "0")}`;

            const ev: DayEvent = {
              id: t.id,
              eventId: event.id,
              calendarId: event.calendar_id,
              title: event.title,
              description: event.description ?? "",
              location: event.location ?? "",
              startTime,
              endTime,
            };

            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(ev);
          }
        }
      }

      // Ordenar eventos de cada día por hora de inicio
      for (const [k, arr] of map.entries()) {
        arr.sort((a, b) =>
          a.startTime < b.startTime ? -1 : a.startTime > b.startTime ? 1 : 0
        );
        map.set(k, arr);
      }

      setEventsMap(map);
    } catch (err) {
      console.error("Error cargando eventos del mes", err);
    }
  }

  // ============= Efectos iniciales =============
  useEffect(() => {
    const access_token = localStorage.getItem("access_token");
    if (!access_token) {
      navigate("/");
    } else {
      loadUserCalendars();
    }
  }, [navigate]);

  useEffect(() => {
    if (calendars.length > 0) {
      loadMonthData(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, calendars]);

  // ============= Manejo de checkboxes =============
  const toggleCalendarVisibility = (id: number) => {
    setVisibleCalendarIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ============= Click en un evento (para editar) ============
  const handleEventClick = (e: DayEvent, dateKey: string, date: Date) => {
    setEditingEvent({
      timeId: e.id,
      eventId: e.eventId,
      calendarId: e.calendarId,
      title: e.title,
      description: e.description,
      location: e.location,
      date: dateKey,
      startTime: e.startTime,
      endTime: e.endTime,
    });
    setSelectedDate(date);
    setShowModal(true);
  };

  // === datos para vista semanal ===
  const weekStart = getMonday(value);
  const weekDays: Date[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const weekEvents: WeekEvent[] = [];
  for (const day of weekDays) {
    const key = day.toISOString().slice(0, 10);
    const dayItems = (eventsMap.get(key) || []).filter((e) =>
      visibleCalendarIds.has(e.calendarId)
    );
    for (const e of dayItems) {
      weekEvents.push({
        id: e.id,
        calendarId: e.calendarId,
        title: e.title,
        date: key,
        startTime: e.startTime,
        endTime: e.endTime,
      });
    }
  }

  return (
    <div className="calendar-page">
      <TopBar
        onProfileClick={() => setShowProfile(true)}
        onLogoutClick={handleLogout}
      />

      <div className="calendar-layout">
        {/* === PANEL LATERAL === */}
        <CalendarSidebar
          calendars={calendars}
          visibleCalendarIds={visibleCalendarIds}
          onToggleCalendarVisibility={toggleCalendarVisibility}
          onNewCalendar={() => setShowCreateCalendar(true)}
          onOpenAddSchedule={() => {
            setSelectedDate(value);
            setEditingEvent(null);
            setShowModal(true);
          }}
          onGenerateSchedule={() => loadMonthData(value)}
          onRequestDeleteCalendar={(cal) => {
            setCalendarToDelete(cal);
            setShowDeleteCalendar(true);
          }}
        />

        {/* === CONTENIDO PRINCIPAL === */}
        <div className="calendar-content">
          <header className="calendar-header">
            <h2>Calendario Planifyme</h2>

            {/* Dropdown Mes / Semana */}
            <div className="view-dropdown">
              <button
                type="button"
                className="view-dropdown-toggle"
                onClick={() => setViewDropdownOpen((open) => !open)}
              >
                {viewMode === "month" ? "Mes" : "Semana"}
                <span className="view-dropdown-caret">▾</span>
              </button>

              {viewDropdownOpen && (
                <div className="view-dropdown-menu">
                  <button
                    type="button"
                    className={
                      "view-dropdown-item" +
                      (viewMode === "month"
                        ? " view-dropdown-item--active"
                        : "")
                    }
                    onClick={() => {
                      setViewMode("month");
                      setViewDropdownOpen(false);
                    }}
                  >
                    Mes
                  </button>
                  <button
                    type="button"
                    className={
                      "view-dropdown-item" +
                      (viewMode === "week"
                        ? " view-dropdown-item--active"
                        : "")
                    }
                    onClick={() => {
                      // 👉 al cambiar a semana, ir a la semana actual
                      setViewMode("week");
                      setValue(new Date());
                      setViewDropdownOpen(false);
                    }}
                  >
                    Semana
                  </button>
                </div>
              )}
            </div>
          </header>

          <main className="calendar-main">
            {viewMode === "month" ? (
              <MonthCalendar
                date={value}
                onChangeDate={setValue}
                eventsMap={eventsMap}
                calendars={calendars}
                visibleCalendarIds={visibleCalendarIds}
                onClickDay={(date) => {
                  setSelectedDate(date);
                  setEditingEvent(null);
                  setShowModal(true);
                }}
                onClickEvent={handleEventClick}
              />
            ) : (
              <WeekView
                weekDays={weekDays}
                events={weekEvents}
                calendars={calendars}
                onSlotClick={({ date, hour }) => {
                  const [Y, M, D] = date.split("-").map(Number);
                  const dt = new Date(Y, M - 1, D, hour, 0, 0, 0);
                  setSelectedDate(dt);
                  setEditingEvent(null);
                  setShowModal(true);
                }}
                onEventClick={(we) => {
                  const key = we.date;
                  const list = eventsMap.get(key) || [];
                  const dayEvent = list.find((e) => e.id === we.id);
                  if (!dayEvent) return;
                  const d = new Date(key);
                  handleEventClick(dayEvent, key, d);
                }}
              />
            )}
          </main>
        </div>
      </div>

      {/* Modal crear / editar evento + times */}
      <AddScheduleModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingEvent(null);
        }}
        onCreated={() => {
          loadMonthData(value);
        }}
        initialDate={selectedDate ?? new Date()}
        calendars={calendars}
        editingEvent={editingEvent}
      />

      {/* Perfil */}
      <UserProfileModal
        open={showProfile}
        onClose={() => setShowProfile(false)}
      />

      {/* Crear calendario */}
      <CalendarioModal
        open={showCreateCalendar}
        onClose={() => setShowCreateCalendar(false)}
        onCreated={loadUserCalendars}
      />

      {/* Eliminar calendario */}
      <EliminarCalendario
        open={showDeleteCalendar}
        calendarId={calendarToDelete?.id ?? null}
        calendarName={calendarToDelete?.name}
        onClose={() => {
          setShowDeleteCalendar(false);
          setCalendarToDelete(null);
        }}
        onDeleted={async () => {
          await loadUserCalendars();
          await loadMonthData(value);
        }}
      />
    </div>
  );
}

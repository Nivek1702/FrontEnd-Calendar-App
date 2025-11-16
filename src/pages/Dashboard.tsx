// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import { api } from "../api";
import AddScheduleModal from "../components/EventoModal";
import { formatRangeLabel } from "../utils/datetime";
import "../css/CalendarioNav.css";
import "../index.css";
import "../css/Dashboard.css";
import TopBar from "../components/TopBar";
import UserProfileModal from "./user-profile";
import { useNavigate } from "react-router-dom";
import CalendarioModal from "../components/CalendarioModal";

type UserCalendar = {
  id: number;
  name: string;
  description: string;
  color: string;
};

type DayEvent = {
  id: number; // id del time
  eventId: number;
  calendarId: number;
  title: string;
  description: string;
  location: string;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
};

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

export default function Dashboard() {
  const navigate = useNavigate();

  const [value, setValue] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [eventsMap, setEventsMap] = useState<Map<string, DayEvent[]>>(
    new Map()
  );

  const [showModal, setShowModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showCreateCalendar, setShowCreateCalendar] = useState(false); // por si luego lo usas

  const [calendars, setCalendars] = useState<UserCalendar[]>([]);
  const [visibleCalendarIds, setVisibleCalendarIds] = useState<Set<number>>(
    new Set()
  );

  // evento que se está editando (si es null => modo crear)
  const [editingEvent, setEditingEvent] = useState<EditableEvent | null>(null);

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
      // por defecto todos visibles
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

      // Pedimos para cada calendario sus eventos+times
      const requests = calendars.map(async (cal) => {
        const { data } = await api.get(
          `/calendars/get_calendar_events_times/${cal.id}`,
          authConfig
        );
        return { calendar: cal, data };
      });

      const responses = await Promise.all(requests);
      const map = new Map<string, DayEvent[]>();

      for (const { calendar, data } of responses) {
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

      // ordenar cada día por hora inicio
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

  // ============= Efectos iniciales ============
  useEffect(() => {
    const access_token = localStorage.getItem("access_token");
    if (!access_token) {
      navigate("/");
    } else {
      loadUserCalendars();
    }
  }, [navigate]);

  // recargar eventos cuando cambie el mes o los calendarios
  useEffect(() => {
    if (calendars.length > 0) {
      loadMonthData(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, calendars]);

  const monthKey = `${value.getFullYear()}-${value.getMonth() + 1}`;

  // ============= Manejo de checkboxes ============
  const toggleCalendarVisibility = (id: number) => {
    setVisibleCalendarIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ============= Render de eventos por día ============
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
              }}
              onClick={(ev) => {
                ev.stopPropagation();
                // preparar datos para editar
                setEditingEvent({
                  timeId: e.id,
                  eventId: e.eventId,
                  calendarId: e.calendarId,
                  title: e.title,
                  description: e.description,
                  location: e.location,
                  date: key,
                  startTime: e.startTime,
                  endTime: e.endTime,
                });
                setSelectedDate(date);
                setShowModal(true);
              }}
            >
              <div style={{ fontWeight: 600 }}>{e.title}</div>
              <div style={{ fontSize: "0.78rem", opacity: 0.8 }}>
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
    <div className="calendar-page">
      <TopBar
        onProfileClick={() => setShowProfile(true)}
        onLogoutClick={handleLogout}
      />

      <div className="calendar-layout">
        {/* === PANEL LATERAL IZQUIERDO === */}
        <aside className="calendar-sidebar">
          <h5 className="sidebar-title">Mis calendarios</h5>

          <ul className="calendar-list">
            {calendars.length === 0 && (
              <li className="calendar-list-empty">
                Aún no tienes calendarios
              </li>
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
                    onChange={() => toggleCalendarVisibility(cal.id)}
                  />
                  <span
                    className="calendar-color-dot"
                    style={{ backgroundColor: cal.color }}
                  />
                  <span className="calendar-name">{cal.name}</span>
                </li>
              );
            })}
          </ul>

          <button
            className="btn btn-outline-primary w-100 mt-3"
            onClick={() => setShowCreateCalendar(true)}
          >
            + Nuevo calendario
          </button>

          <div className="sidebar-actions">
            <button
              className="btn btn-primary w-100"
              onClick={() => {
                setSelectedDate(value);
                setEditingEvent(null); // modo crear
                setShowModal(true);
              }}
            >
              Ingresar horario
            </button>
            <button
              className="btn btn-success w-100"
              onClick={() => loadMonthData(value)}
            >
              Generar horario
            </button>
          </div>
        </aside>

        {/* === CONTENIDO PRINCIPAL === */}
        <div className="calendar-content">
          <header className="calendar-header">
            <h2>Calendario Planifyme</h2>
          </header>

          <main className="calendar-main">
            <Calendar
              value={value}
              onChange={(v) => setValue(v as Date)}
              tileContent={tileContent}
              onClickDay={(date) => {
                setSelectedDate(date);
                setEditingEvent(null); // nuevo evento
                setShowModal(true);
              }}
            />
          </main>
        </div>
      </div>

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

      <UserProfileModal
        open={showProfile}
        onClose={() => setShowProfile(false)}
      />

      {/* Si usas un modal separado para crear calendario, lo dejas aquí */}
      <CalendarioModal
        open={showCreateCalendar}
        onClose={() => setShowCreateCalendar(false)}
        onCreated={loadUserCalendars}
      />
    </div>
  );
}

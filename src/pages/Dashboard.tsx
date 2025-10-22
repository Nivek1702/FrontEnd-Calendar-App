import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import { api } from "../api";
import AddScheduleModal from "../components/EventoModal";
import { formatRangeLabel } from "../utils/datetime";
import { calendarIdFromDate } from "../utils/calendar_id";
import "../index.css";
import TopBar from "../components/TopBar";
import UserProfileModal from "./user-profile"; // 👈 importante
import { useNavigate } from "react-router-dom";

type DayEvent = { title: string; start: string; end: string };

function datesOfMonth(viewDate: Date): Date[] {
  const y = viewDate.getFullYear();
  const m = viewDate.getMonth();
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);

  const out: Date[] = [];
  for (let d = new Date(first); d <= last; d = new Date(y, m, d.getDate() + 1)) {
    out.push(new Date(d));
  }
  return out;
}

export default function Dashboard() {
  const navigate = useNavigate(); // 👈 inicializa navigate
  const [value, setValue] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [eventsMap, setEventsMap] = useState<Map<string, DayEvent[]>>(new Map());
  const [showModal, setShowModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false); // 👈 nuevo estado

  // ✅ Verifica si hay sesión activa
  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    console.log("🧠 ID del usuario en sesión:", userId); // 👈 Aquí se imprime el valor guardado
    if (!userId) {
      navigate("/"); // si no hay sesión, redirige al login
    }
  }, [navigate]);

  const monthKey = `${value.getFullYear()}-${value.getMonth() + 1}`;

  async function loadMonthData(viewDate: Date) {
    const days = datesOfMonth(viewDate);
    const requests = days.map(async (d) => {
      const cid = calendarIdFromDate(d);
      try {
        const { data } = await api.get(`/calendars/get_calendar_events_times/${cid}`);
        return { date: d, data };
      } catch (e: any) {
        if (e?.response?.status === 404) return { date: d, data: null };
        throw e;
      }
    });

    const results = await Promise.all(requests);
    const map = new Map<string, DayEvent[]>();

    for (const r of results) {
      const key = r.date.toISOString().slice(0, 10);
      if (!r.data) {
        map.set(key, []);
        continue;
      }
      const arr: DayEvent[] = [];
      for (const et of r.data.events_times || []) {
        for (const t of et.times || []) {
          const start = `${String(t.start_time.hour).padStart(2, "0")}:${String(
            t.start_time.minute
          ).padStart(2, "0")}`;
          const end = `${String(t.end_time.hour).padStart(2, "0")}:${String(
            t.end_time.minute
          ).padStart(2, "0")}`;
          arr.push({ title: et.event.title, start, end });
        }
      }
      arr.sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));
      map.set(key, arr);
    }

    setEventsMap(map);
  }

  useEffect(() => {
    loadMonthData(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthKey]);

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return null;
    const key = date.toISOString().slice(0, 10);
    const items = eventsMap.get(key) || [];
    if (items.length === 0) return null;

    return (
      <div
        className="mt-1"
        style={{ display: "flex", flexDirection: "column", gap: 6 }}
      >
        {items.slice(0, 3).map((e, i) => (
          <div key={i} className="cal-event">
            <div style={{ fontWeight: 600 }}>{e.title}</div>
            <div style={{ fontSize: "0.78rem", opacity: 0.8 }}>
              {formatRangeLabel(e.start, e.end)}
            </div>
          </div>
        ))}
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
      {/* ✅ pasamos la función al TopBar */}
      <TopBar onProfileClick={() => setShowProfile(true)} />

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
            setShowModal(true);
          }}
        />
      </main>

      <footer className="calendar-actions">
        <button className="btn btn-dark">Importar horario</button>
        <button
          className="btn btn-primary"
          onClick={() => {
            setSelectedDate(value);
            setShowModal(true);
          }}
        >
          Ingresar horario
        </button>
        <button
          className="btn btn-success"
          onClick={() => loadMonthData(value)}
        >
          Generar horario
        </button>
      </footer>

      <AddScheduleModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onCreated={() => loadMonthData(value)}
        initialDate={selectedDate ?? new Date()}
      />

      {/* 👇 Modal de detalle de usuario */}
      <UserProfileModal open={showProfile} onClose={() => setShowProfile(false)} />
    </div>
  );
}


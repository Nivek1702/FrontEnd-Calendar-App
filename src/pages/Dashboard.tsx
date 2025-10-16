// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import Calendar from "react-calendar";
import type { CalendarProps } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Button, ButtonGroup } from "react-bootstrap";
import { api } from "../api";
import "../index.css";

type CalValue = CalendarProps["value"];
type EventItem = { id: string; title: string; type?: "work" | "personal" | "reminder" };

// YYYY-MM-DD
const fmt = (d: Date) => d.toISOString().slice(0, 10);

export default function Dashboard() {
  const [value, setValue] = useState<CalValue>(new Date());
  const [activeMonth, setActiveMonth] = useState<Date>(new Date());

  // Mapa demo de eventos por fecha (reemplaza por datos de tu backend)
  const [eventsByDate] = useState<Record<string, EventItem[]>>({
    [fmt(new Date())]: [
      { id: "1", title: "Daily stand-up", type: "work" },
      { id: "2", title: "Gym", type: "personal" },
    ],
  });

  useEffect(() => {
    (async () => {
      try {
        await api.get("/users"); // ping de prueba
      } catch {
        /* noop */
      }
    })();
  }, [activeMonth]);

  // Siempre renderizamos un panel interno (mismo tamaño con o sin eventos)
  const tileContent: CalendarProps["tileContent"] = ({ date, view }) => {
    if (view !== "month") return null;
    const items = eventsByDate[fmt(date)] ?? [];

    return (
      <div className="tile-panel">
        <div className="tile-events">
          {items.slice(0, 3).map((ev) => (
            <span key={ev.id} className={`event-pill ${ev.type ?? ""}`}>
              {ev.title}
            </span>
          ))}
          {items.length > 3 && (
            <span className="event-more">+{items.length - 3} más</span>
          )}
        </div>
      </div>
    );
  };

  // Para resaltar el día de hoy
  const todayStr = new Date().toDateString();

  return (
    <div className="calendar-page">
      <TopBar />

      <div className="calendar-viewport">
        <div className="calendar-container">
          <Calendar
            value={value}
            onChange={setValue}
            view="month"
            className="my-calendar"
            tileContent={tileContent}
            tileClassName={({ date, view }) =>
              view === "month" && date.toDateString() === todayStr
                ? "is-today"
                : undefined
            }
            onActiveStartDateChange={({ activeStartDate }) => {
              if (activeStartDate) setActiveMonth(activeStartDate);
            }}
          />
        </div>
      </div>
      <div className="calendar-actions">
          <ButtonGroup>
            <Button variant="dark">Importar horario</Button>
            <Button variant="primary">Ingresar horario</Button>
            <Button variant="success">Generar horario</Button>
          </ButtonGroup>
        </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { api } from "../api";
import { toVO } from "../utils/datetime";
import { calendarIdFromDate } from "../utils/calendar_id";

type NewTimeSlot = {
  date: Date;
  start: string; // "HH:MM"
  end: string;   // "HH:MM"
};

type Props = {
  show: boolean;
  onClose: () => void;
  onCreated: () => void;     // ← el padre hará el GET después de crear
  initialDate?: Date;        // fecha del bloque clicado en el calendario
  calendarId?: number;       // compat
};

// YYYY-MM-DD para mostrar/usar como name del calendario
function ymd(d: Date) {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function AddScheduleModal({
  show,
  onClose,
  onCreated,
  initialDate,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [slots, setSlots] = useState<NewTimeSlot[]>([
    { date: initialDate ?? new Date(), start: "09:00", end: "10:00" },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ⚠️ Ajusta con el id real del usuario autenticado si lo tienes
  const userId = 0;

  useEffect(() => {
    if (!show) return;
    setSlots([{ date: initialDate ?? new Date(), start: "09:00", end: "10:00" }]);
  }, [show, initialDate]);

  const updateSlot = (idx: number, patch: Partial<NewTimeSlot>) => {
    setSlots((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  const addSlot = () =>
    setSlots((prev) => [...prev, { date: initialDate ?? new Date(), start: "09:00", end: "10:00" }]);

  const removeSlot = (idx: number) =>
    setSlots((prev) => prev.filter((_, i) => i !== idx));

  /**
   * Asegura/crea el Calendar para el día.
   * - Calcula el id con calendarIdFromDate(day) (estructura acordada).
   * - Busca por id en GET /calendars/get_all_calendars/{user_id}
   * - Si no existe, hace POST /calendars/create_calendar enviando ese id.
   */
  async function ensureCalendarForDay(day: Date): Promise<{ id: number }> {
    const calId = calendarIdFromDate(day);      // ← id con tu formato (p.ej. DDMMAAAA o AAAAMMDD)
    const name = ymd(day);                      // usamos el name como "YYYY-MM-DD" para referencia visual

    // 1) listar los calendars del usuario y buscar por id
    const listRes = await api.get(`/calendars/get_all_calendars/${userId}`);
    const calendars = listRes.data as Array<{ id: number; name: string }>;
    const found = calendars.find((c) => c.id === calId);
    if (found) return { id: found.id };

    // 2) no existe → crearlo enviando el id explícitamente
    const createRes = await api.post("/calendars/create_calendar", {
      id: calId,                           // ← se envía el id acordado
      name,                                // ← "YYYY-MM-DD"
      description: "Calendario del día",
      color: "#1a73e8",
      user_id: userId,
    });
    return { id: createRes.data.id as number };
  }

  async function handleSubmit() {
    setError(null);

    if (!title.trim()) {
      setError("El título es obligatorio.");
      return;
    }
    for (const s of slots) {
      if (!s.start || !s.end) {
        setError("Todos los bloques deben tener hora de inicio y fin.");
        return;
      }
      if (s.start >= s.end) {
        setError("La hora de inicio debe ser menor a la de fin.");
        return;
      }
    }

    setSubmitting(true);
    try {
      // 1) Agrupar bloques por fecha (clave YYYY-MM-DD)
      const grouped = new Map<string, NewTimeSlot[]>();
      for (const s of slots) {
        const key = ymd(s.date);
        const arr = grouped.get(key) || [];
        arr.push(s);
        grouped.set(key, arr);
      }

      // 2) Para cada fecha: asegurar/crear Calendar (enviando id) → crear Event → crear Times
      for (const [, daySlots] of grouped.entries()) {
        const day = daySlots[0].date;

        // (2.1) asegurar/crear Calendar del día (envía id = calendarIdFromDate(day))
        const { id: calendar_id } = await ensureCalendarForDay(day);

        // (2.2) crear Event en ese calendar
        const eventRes = await api.post("/events/create_event", {
          title: title.trim(),
          description: description.trim(),
          location: location.trim(),
          calendar_id,
        });
        const event = eventRes.data as { id: number };

        // (2.3) crear Times (bloques) del event
        for (const s of daySlots) {
          await api.post("/times/create_time", {
            start_time: toVO(s.date, s.start),
            end_time: toVO(s.date, s.end),
            event_id: event.id,
          });
        }
      }

      // 3) Avisar al padre que refresque (GET)
      onCreated();

      // 4) Limpiar y cerrar
      setTitle("");
      setDescription("");
      setLocation("");
      setSlots([{ date: initialDate ?? new Date(), start: "09:00", end: "10:00" }]);
      onClose();
    } catch (e: any) {
      setError(e?.response?.data ?? "No se pudo registrar el horario.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Ingresar horario</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Título *</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej. Reunión con equipo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Form.Group>

          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Opcional"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Ubicación</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Opcional"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          <hr className="my-2" />
          <div className="mb-2 d-flex align-items-center justify-content-between">
            <strong>Bloques de horario</strong>
            <Button size="sm" variant="outline-primary" onClick={addSlot}>
              + Agregar bloque
            </Button>
          </div>

          {slots.map((s, idx) => (
            <Row key={idx} className="g-2 align-items-end mb-2">
              <Col md={5}>
                <Form.Group>
                  <Form.Label>Fecha</Form.Label>
                  <Form.Control
                    type="date"
                    value={ymd(s.date)}
                    onChange={(e) => updateSlot(idx, { date: new Date(e.target.value) })}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Inicio</Form.Label>
                  <Form.Control
                    type="time"
                    value={s.start}
                    onChange={(e) => updateSlot(idx, { start: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Fin</Form.Label>
                  <Form.Control
                    type="time"
                    value={s.end}
                    onChange={(e) => updateSlot(idx, { end: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={1} className="text-end">
                {slots.length > 1 && (
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => removeSlot(idx)}
                  >
                    ×
                  </Button>
                )}
              </Col>
            </Row>
          ))}

          {error && <div className="text-danger mt-2">{error}</div>}
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Guardando..." : "Guardar"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

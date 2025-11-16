// src/components/EventoModal.tsx
import { useEffect, useState } from "react";
import { api } from "../api";

interface UserCalendar {
  id: number;
  name: string;
  description: string;
  color: string;
}

interface EditableEvent {
  timeId: number;
  eventId: number;
  calendarId: number;
  title: string;
  description: string;
  location: string;
  date: string;      // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
}

interface AddScheduleModalProps {
  show: boolean;
  onClose: () => void;
  onCreated: () => void;
  initialDate: Date;
  calendars: UserCalendar[];
  editingEvent?: EditableEvent | null;
}

type Block = {
  date: string;      // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
};

export default function AddScheduleModal({
  show,
  onClose,
  onCreated,
  initialDate,
  calendars,
  editingEvent,
}: AddScheduleModalProps) {
  const [calendarId, setCalendarId] = useState<number | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = Boolean(editingEvent);

  // Inicializar campos cuando se abre el modal
  useEffect(() => {
    if (!show) return;

    const isoInit = initialDate.toISOString().slice(0, 10);

    if (editingEvent) {
      // Modo edición
      setCalendarId(editingEvent.calendarId);
      setTitle(editingEvent.title);
      setDescription(editingEvent.description || "");
      setLocation(editingEvent.location || "");
      setBlocks([
        {
          date: editingEvent.date,
          startTime: editingEvent.startTime,
          endTime: editingEvent.endTime,
        },
      ]);
    } else {
      // Modo creación
      const defaultCal =
        calendars.length > 0 ? calendars[0].id : ("" as number | "");
      setCalendarId(defaultCal);
      setTitle("");
      setDescription("");
      setLocation("");
      setBlocks([
        {
          date: isoInit,
          startTime: "09:00",
          endTime: "10:00",
        },
      ]);
    }

    setError(null);
  }, [show, editingEvent, initialDate, calendars]);

  const handleChangeBlock = (
    index: number,
    field: keyof Block,
    value: string
  ) => {
    setBlocks((prev) =>
      prev.map((b, i) => (i === index ? { ...b, [field]: value } : b))
    );
  };

  const handleAddBlock = () => {
    const today = new Date().toISOString().slice(0, 10);
    setBlocks((prev) => [
      ...prev,
      { date: today, startTime: "09:00", endTime: "10:00" },
    ]);
  };

  const handleRemoveBlock = (index: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!calendarId) {
      setError("Debes seleccionar un calendario.");
      return;
    }

    if (blocks.length === 0) {
      setError("Debes registrar al menos un bloque de horario.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Sesión expirada, vuelve a iniciar sesión");

      const authConfig = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (isEditMode && editingEvent) {
        // ========== MODO EDITAR ==========
        const block = blocks[0]; // solo editamos este bloque
        const [year, month, day] = block.date.split("-").map(Number);
        const [sh, sm] = block.startTime.split(":").map(Number);
        const [eh, em] = block.endTime.split(":").map(Number);

        // 1. Actualizar evento
        await api.put(
          `/events/update_event/${editingEvent.eventId}`,
          {
            title,
            description,
            location,
            calendar_id: calendarId,
          },
          authConfig
        );

        // 2. Actualizar time
        await api.put(
          `/times/update_time/${editingEvent.timeId}`,
          {
            start_time: {
              year,
              month,
              day,
              hour: sh,
              minute: sm,
            },
            end_time: {
              year,
              month,
              day,
              hour: eh,
              minute: em,
            },
            event_id: editingEvent.eventId,
          },
          authConfig
        );
      } else {
        // ========== MODO CREAR ==========
        // 1. Crear evento
        const { data: created } = await api.post(
          "/events/create_event",
          {
            title,
            description,
            location,
            calendar_id: calendarId,
          },
          authConfig
        );

        const eventId: number = created.id ?? created.event_id ?? created;

        // 2. Crear times para cada bloque
        for (const b of blocks) {
          const [year, month, day] = b.date.split("-").map(Number);
          const [sh, sm] = b.startTime.split(":").map(Number);
          const [eh, em] = b.endTime.split(":").map(Number);

          await api.post(
            "/times/create_time",
            {
              start_time: {
                year,
                month,
                day,
                hour: sh,
                minute: sm,
              },
              end_time: {
                year,
                month,
                day,
                hour: eh,
                minute: em,
              },
              event_id: eventId,
            },
            authConfig
          );
        }
      }

      onCreated();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.detail ||
          "Ocurrió un error al guardar el horario."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlock = async () => {
    if (!editingEvent) return;
    if (!window.confirm("¿Eliminar este bloque de horario?")) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Sesión expirada, vuelve a iniciar sesión");

      const authConfig = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await api.delete(`/times/delete_time/${editingEvent.timeId}`, authConfig);

      onCreated();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.detail ||
          "Ocurrió un error al eliminar el bloque."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <>
      <div className="popup-backdrop" onClick={onClose} />

      <div className="popup-modal" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h5 className="popup-title">
            {isEditMode ? "Editar horario" : "Ingresar horario"}
          </h5>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="popup-body">
            {error && <div className="alert alert-danger">{error}</div>}

            {/* Calendario */}
            <div className="mb-3">
              <label className="form-label">Calendario</label>
              <select
                className="form-select"
                value={calendarId}
                onChange={(e) => setCalendarId(Number(e.target.value))}
                disabled={isEditMode} // normalmente el calendario no se cambia
              >
                <option value="">Selecciona un calendario</option>
                {calendars.map((cal) => (
                  <option key={cal.id} value={cal.id}>
                    {cal.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Título */}
            <div className="mb-3">
              <label className="form-label">Título *</label>
              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Descripción / Ubicación */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Descripción</label>
                <input
                  type="text"
                  className="form-control"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Opcional"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Ubicación</label>
                <input
                  type="text"
                  className="form-control"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Opcional"
                />
              </div>
            </div>

            {/* Bloques de horario */}
            <div className="mb-2 d-flex justify-content-between align-items-center">
              <span className="fw-semibold">Bloques de horario</span>
              {!isEditMode && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={handleAddBlock}
                >
                  + Agregar bloque
                </button>
              )}
            </div>

            {blocks.map((b, index) => (
              <div key={index} className="row align-items-center mb-2">
                <div className="col-md-4 mb-2 mb-md-0">
                  <input
                    type="date"
                    className="form-control"
                    value={b.date}
                    onChange={(e) =>
                      handleChangeBlock(index, "date", e.target.value)
                    }
                  />
                </div>
                <div className="col-md-3 mb-2 mb-md-0">
                  <input
                    type="time"
                    className="form-control"
                    value={b.startTime}
                    onChange={(e) =>
                      handleChangeBlock(index, "startTime", e.target.value)
                    }
                  />
                </div>
                <div className="col-md-3 mb-2 mb-md-0">
                  <input
                    type="time"
                    className="form-control"
                    value={b.endTime}
                    onChange={(e) =>
                      handleChangeBlock(index, "endTime", e.target.value)
                    }
                  />
                </div>
                {!isEditMode && blocks.length > 1 && (
                  <div className="col-md-2 text-end">
                    <button
                      type="button"
                      className="btn btn-link text-danger"
                      onClick={() => handleRemoveBlock(index)}
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="popup-footer d-flex justify-content-between">
            {isEditMode ? (
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={handleDeleteBlock}
                disabled={loading}
              >
                Eliminar bloque
              </button>
            ) : (
              <span />
            )}

            <div>
              <button
                type="button"
                className="btn btn-secondary me-2"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Guardando..." : isEditMode ? "Guardar cambios" : "Guardar"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

// src/components/CalendarioModal.tsx
import { useEffect, useState } from "react";
import { api } from "../api";
import type { UserCalendar } from "../types/calendar";
import "../css/CalendarioModal.css";

interface CalendarioModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;              // crear
  onUpdated?: () => void;              // editar
  calendar?: UserCalendar | null;      // calendario a editar (null = crear)
}

export default function CalendarioModal({
  open,
  onClose,
  onCreated,
  onUpdated,
  calendar,
}: CalendarioModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#1e90ff");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!calendar;

  useEffect(() => {
    if (!open) return;

    if (calendar) {
      // Modo edición: precargar datos
      setName(calendar.name ?? "");
      setDescription(calendar.description ?? "");
      setColor(calendar.color ?? "#1e90ff");
    } else {
      // Modo creación: limpiar
      setName("");
      setDescription("");
      setColor("#1e90ff");
    }
    setError(null);
  }, [open, calendar]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Sesión expirada. Vuelve a iniciar sesión.");
      }

      const payload = {
        name,
        description,
        color,
      };

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (isEdit && calendar) {
        // EDITAR CALENDARIO
        await api.put(
          `/calendars/update_calendar/${calendar.id}`,
          payload,
          config
        );
        onUpdated?.();
      } else {
        // CREAR CALENDARIO
        await api.post("/calendars/create_calendar", payload, config);
        onCreated?.();
      }

      onClose();
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.detail ||
          err.message ||
          (isEdit
            ? "Ocurrió un error al actualizar el calendario"
            : "Ocurrió un error al crear el calendario")
      );
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="popup-backdrop" onClick={onClose} />

      <div className="popup-modal" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h5 className="popup-title">
            {isEdit ? "Editar calendario" : "Nuevo calendario"}
          </h5>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="popup-body">
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Descripción</label>
              <textarea
                className="form-control"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Color</label>
              <input
                type="color"
                className="form-control form-control-color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
          </div>

          <div className="popup-footer">
            <button
              type="button"
              className="btn btn-secondary"
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
              {loading
                ? "Guardando..."
                : isEdit
                ? "Guardar cambios"
                : "Crear calendario"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

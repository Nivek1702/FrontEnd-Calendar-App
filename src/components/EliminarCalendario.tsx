// src/components/EliminarCalendario.tsx
import { useState } from "react";
import { api } from "../api";
import "../css/CalendarioModal.css"; // reutilizamos estilos de popup

export interface DeleteCalendarProps {
  open: boolean;
  calendarId: number | null;
  calendarName?: string;
  onClose: () => void;
  onDeleted: () => void;     // para refrescar la lista en el Dashboard
}

export default function EliminarCalendario({
  open,
  calendarId,
  calendarName,
  onClose,
  onDeleted,
}: DeleteCalendarProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open || calendarId == null) return null;

  const handleDelete = async () => {
    setError(null);
    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Sesión expirada, vuelve a iniciar sesión");

      await api.delete<boolean>(
        `/calendars/delete_calendar/${calendarId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onDeleted(); // recargar calendarios/eventos en el Dashboard
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.detail ||
          "Ocurrió un error al eliminar el calendario"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="popup-backdrop" onClick={onClose} />

      <div className="popup-modal" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h5 className="popup-title">Eliminar calendario</h5>
        </div>

        <div className="popup-body">
          {error && <div className="alert alert-danger">{error}</div>}

          <p>
            ¿Estás seguro de que deseas eliminar el calendario{" "}
            <strong>{calendarName ?? `#${calendarId}`}</strong>?
          </p>
          <p className="text-muted" style={{ fontSize: "0.9rem" }}>
            Esta acción eliminará también sus eventos y horarios asociados.
          </p>
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
            type="button"
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </>
  );
}

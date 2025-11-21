import { useEffect, useState } from "react";
import { api } from "../api";
import "./user-profile.css";

export type User = {
  id: string;
  name: string;
  username?: string;
  email: string;
  is_verified: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function UserProfileModal({ open, onClose }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        // 👉 ajusta si tu API usa otra ruta
        const token = localStorage.getItem("access_token");
        if (!token) throw new Error("Sesión expirada, vuelve a iniciar sesión");

        const { data } = await api.get(`/users/get_user/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        setUser(data);
      } catch (e: any) {
        console.error(e);
        setErr(e?.response?.data?.message || "No se pudo cargar el usuario.");
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  if (!open) return null;

  return (
    <div className="upm-backdrop" onClick={onClose}>
      <div className="upm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="upm-header">
          <h3>Detalle de usuario</h3>
          <button className="upm-x" onClick={onClose} aria-label="Cerrar">×</button>
        </div>

        {loading && <p className="upm-muted">Cargando…</p>}
        {err && <p className="upm-error">{err}</p>}

        {user && !loading && !err && (
          <div className="upm-body">
            <dl>
              {/* <dt>ID</dt><dd>{user.id}</dd> */}
              <dt>Nombre</dt><dd>{user.name}</dd>
              {user.username && (<><dt>Usuario</dt><dd>{user.username}</dd></>)}
              <dt>Email</dt><dd>{user.email}</dd>
              <dt>Verificado</dt><dd>{user.is_verified ? "Sí" : "No"}</dd>
            </dl>
          </div>
        )}

        <div className="upm-footer">
          <button className="upm-btn" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

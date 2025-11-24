// src/pages/reset-password.tsx
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../api";
import "./reset-password.css";
import chatbotLogo from "../Imagenes/chatbot.png";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { email?: string } };
  const email = location?.state?.email ?? ""; // viene de ForgotPassword

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [code, setCode] = useState("");          // 🔹 nuevo: código de verificación

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordsMatch = password === confirm;
  const hasCode = code.trim().length > 0;
  const canSubmit = password.length >= 8 && passwordsMatch && hasCode && !loading;

  const handleSave = async () => {
    setError(null);

    if (!email) {
      setError("Falta el email de la cuenta. Vuelve a ‘Olvidé mi contraseña’.");
      return;
    }
    if (!passwordsMatch) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (!hasCode) {
      setError("Ingresa el código de verificación enviado a tu correo.");
      return;
    }

    try {
      setLoading(true);
      await api.put("/users/change_password", {
        email,
        password,
        verification_code: code.trim(), 
      });
      navigate("/");
    } catch (e: any) {
      console.error(e);
      setError(
        e?.response?.data?.detail ||
          e?.response?.data?.message ||
          "No se pudo actualizar la contraseña."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rp-container">
      <div className="rp-card">
        <img src={chatbotLogo} alt="Chatbot Logo" className="rp-logo" />
        <h2>Crear nueva contraseña</h2>
        {email && <p className="rp-subtitle">Cuenta: {email}</p>}

        <label className="rp-label" htmlFor="pwd">
          Nueva contraseña
        </label>
        <input
          id="pwd"
          type="password"
          placeholder="Mínimo 8 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rp-input"
          autoComplete="new-password"
        />

        <label className="rp-label" htmlFor="confirm">
          Repite la contraseña
        </label>
        <input
          id="confirm"
          type="password"
          placeholder="Repite la contraseña"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="rp-input"
          autoComplete="new-password"
        />

        {/* 🔹 Campo para el código de verificación */}
        <label className="rp-label" htmlFor="code">
          Código de verificación
        </label>
        <input
          id="code"
          type="text"
          placeholder="Código enviado a tu correo"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="rp-input"
        />

        {!passwordsMatch && confirm && (
          <p className="rp-error">Las contraseñas no coinciden.</p>
        )}
        {password.length > 0 && password.length < 8 && (
          <p className="rp-error">
            La contraseña debe tener al menos 8 caracteres.
          </p>
        )}
        {error && <p className="rp-error">{error}</p>}

        <button
          type="button"
          className="rp-btn primary"
          disabled={!canSubmit}
          onClick={handleSave}
        >
          {loading ? "Guardando..." : "Guardar y volver al login"}
        </button>

        <button
          type="button"
          className="rp-btn link"
          onClick={() => navigate("/")}
        >
          ← Volver al login
        </button>
      </div>
    </div>
  );
}

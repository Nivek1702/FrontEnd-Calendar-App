// src/pages/ForgotPassword.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import "./forgot-password.css";
import chatbotLogo from "../Imagenes/chatbot.png";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const isValidEmail = (val: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const handleSendCode = async () => {
    setMessage(null);
    setError(null);

    const cleanEmail = email.trim();

    if (!isValidEmail(cleanEmail)) {
      setError("Ingresa un correo válido.");
      return;
    }
    if (cooldown > 0) return;

    try {
      setSending(true);

      const { data } = await api.post<boolean>(
        "/users/change_password_send_ver_code",
        { email: cleanEmail }
      );

      if (data === true) {
        // ✅ Código enviado, pasar a la pantalla de nueva contraseña
        navigate("/reset-password", { state: { email: cleanEmail } });
      } else {
        setError("No se pudo enviar el código. Inténtalo nuevamente.");
      }
    } catch (err: any) {
      console.error(err);
      const backendMsg =
        err?.response?.data?.detail || err?.response?.data?.message;

      // 404 -> correo no registrado
      if (err?.response?.status === 404 && backendMsg) {
        setError(backendMsg); // "El correo no está registrado."
      } else {
        setError(
          backendMsg || "No se pudo enviar el código. Inténtalo nuevamente."
        );
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <img src={chatbotLogo} alt="Chatbot Logo" className="fp-logo" />
        <h2>Recuperar contraseña</h2>
        <p className="fp-subtitle">
          Ingresa tu correo y te enviaremos un código de verificación.
        </p>

        <label className="fp-label" htmlFor="email">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          placeholder="tucorreo@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={sending}
          className="fp-input"
        />

        <button
          type="button"
          className="fp-btn primary"
          onClick={handleSendCode}
          disabled={sending || cooldown > 0}
        >
          {sending
            ? "Enviando..."
            : cooldown > 0
            ? `Reenviar código (${cooldown}s)`
            : "Enviar código"}
        </button>

        {message && <p className="fp-message">{message}</p>}
        {error && <p className="fp-error">{error}</p>}

        <button
          type="button"
          className="fp-btn link"
          onClick={() => navigate("/")}
        >
          ← Volver al login
        </button>
      </div>
    </div>
  );
}

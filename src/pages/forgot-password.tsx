import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import "./forgot-password.css";
import chatbotLogo from "../Imagenes/chatbot.png";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string>("");

  const [sending, setSending] = useState<boolean>(false);
  const [verifying, setVerifying] = useState<boolean>(false);

  const [codeSent, setCodeSent] = useState<boolean>(false);
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

    if (!isValidEmail(email)) {
      setError("Ingresa un correo válido.");
      return;
    }
    if (cooldown > 0) return;

    try {
      setSending(true);
      await api.post("/auth/send-reset-code", { email: email.trim() });

      setCodeSent(true);
      setMessage("Código enviado a tu correo. Revisa tu bandeja (y SPAM).");
      setCooldown(60); 
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          "No se pudo enviar el código. Inténtalo nuevamente."
      );
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    setMessage(null);
    setError(null);

    if (!code.trim()) {
      setError("Ingresa el código que recibiste.");
      return;
    }
    try {
      setVerifying(true);
      const { data } = await api.post("/auth/verify-reset-code", {
        email: email.trim(),
        code: code.trim(),
      });

      if (data?.ok === true || data === true) {
        navigate("/reset-password", { state: { email: email.trim() } });
      } else {
        setError("Código incorrecto.");
      }
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.status === 400 || err?.response?.status === 401
          ? "Código incorrecto."
          : err?.response?.data?.message ||
            "No se pudo verificar el código. Inténtalo nuevamente.";
      setError(msg);
    } finally {
      setVerifying(false);
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

        {/* Email */}
        <label className="fp-label" htmlFor="email">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          placeholder="tucorreo@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={sending || verifying}
          className="fp-input"
        />

        <button
          type="button"
          className="fp-btn primary"
          onClick={handleSendCode}
          disabled={sending || verifying || cooldown > 0}
        >
          {sending
            ? "Enviando..."
            : cooldown > 0
            ? `Reenviar código (${cooldown}s)`
            : codeSent
            ? "Reenviar código"
            : "Enviar código"}
        </button>

        {/* Código */}
        <label className="fp-label" htmlFor="code" style={{ marginTop: 14 }}>
          Código de verificación
        </label>
        <input
          id="code"
          type="text"
          inputMode="numeric"
          placeholder="Ingresa el código recibido"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={!codeSent || verifying}
          className="fp-input"
        />

        <button
          type="button"
          className="fp-btn success"
          onClick={handleVerify}
          disabled={!codeSent || verifying}
        >
          {verifying ? "Verificando..." : "Verificar"}
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

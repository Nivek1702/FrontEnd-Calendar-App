import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import "./LoginF.css";
import chatbotLogo from "../Imagenes/chatbot.png";

export default function VerificarUsuarioLogin() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const { data } = await api.post("/users/login_user_verification", {
        user_name: userName,
        verification_code: verificationCode,
      });

      if (data !== null) {
        setMessage("✅ Verificación exitosa, redirigiendo...");
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        setMessage("❌ Código o usuario incorrecto. Inténtalo nuevamente.");
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={chatbotLogo} alt="Chatbot Logo" className="chatbot-logo" />
        <h2>Verificación de ingreso</h2>
        <p style={{ fontSize: "14px", marginBottom: "1rem" }}>
          Ingresa tu nombre de usuario y el código que recibiste por correo.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nombre de usuario"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Código de verificación"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Verificando..." : "Verificar código"}
          </button>
        </form>

        {message && (
          <p className={message.includes("✅") ? "login-success" : "login-error"}>
            {message}
          </p>
        )}

        <p>
          <a href="/">← Volver al login</a>
        </p>
      </div>
    </div>
  );
}

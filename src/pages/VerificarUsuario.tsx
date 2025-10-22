import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import "./LoginF.css"; // reutilizamos el mismo diseño
import chatbotLogo from "../Imagenes/chatbot.png";

export default function VerificarUsuario() {
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
      // Llamada al endpoint /users/validate_user
      const { data } = await api.post("/users/validate_user", {
        user_name: userName,
        verification_code: verificationCode,
      });

      if (data === true) {
        setMessage("✅ Usuario verificado correctamente");
        setTimeout(() => {
          navigate("/"); // Redirige al login
        }, 2000);
      } else {
        setMessage("❌ Código de verificación o usuario incorrecto");
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={chatbotLogo} alt="Chatbot Logo" className="chatbot-logo" />
        <h2>Verificar Usuario</h2>
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
            {loading ? "Verificando..." : "Verificar"}
          </button>
        </form>

        {message && <p className="login-error">{message}</p>}

        <p>
          <a href="/register">← Volver al registro</a>
        </p>
      </div>
    </div>
  );
}

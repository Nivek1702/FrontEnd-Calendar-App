// Componente de Login
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import "./LoginF.css";
import chatbotLogo from "../Imagenes/chatbot.png";

export default function LoginF() {
  const navigate = useNavigate();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data } = await api.post("/users/login_user", {
        username,
        password,
      });

      if (data === true) {
        navigate("/VerificarUsuarioLogin");
      } else {
        setError("Credenciales inválidas");
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={chatbotLogo} alt="Chatbot Logo" className="chatbot-logo" />
        <h2>Iniciar Sesión</h2>

        <form onSubmit={onSubmit}>
          <input
            type="text"
            placeholder="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="login-error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p>
          ¿No tienes cuenta? <a href="/register">Regístrate aquí</a>
        </p>
      </div>
    </div>
  );
}

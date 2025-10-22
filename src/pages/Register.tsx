import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import chatbotLogo from "../Imagenes/chatbot.png";

export default function Register() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:8000/users/create_user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage("Usuario creado correctamente ✅");
        console.log("Usuario creado:", data);

        // Redirigir a verificación después de 2 segundos
        setTimeout(() => {
          navigate("/verify"); // 👈 Redirige a la verificación
        }, 2000);
      } else {
        const errorData = await response.json();
        setMessage("Error al crear usuario: " + JSON.stringify(errorData));
      }
    } catch (error) {
      console.error(error);
      setMessage("Error al conectar con el servidor");
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <img src={chatbotLogo} alt="Chatbot" className="chatbot-logo" />
        <h2>Registro de Usuario</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Registrar</button>
        </form>
        {message && <p className="register-message">{message}</p>}
        <p>
          ¿Ya tienes cuenta?{" "}
          <a href="/">Inicia sesión aquí</a>
        </p>
      </div>
    </div>
  );
}

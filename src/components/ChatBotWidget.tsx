// src/components/ChatbotWidget.tsx
import { useEffect, useState } from "react";
import { api } from "../api";
import "../css/ChatbotWidget.css";
import chatbotIcon from "../../public/chatbot_without_back.png";
import ReactMarkdown from "react-markdown";

type ChatMessage = {
  id: number;
  from: "user" | "bot";
  text: string;
};

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasLoadedGreeting, setHasLoadedGreeting] = useState(false);

  // Abre/cierra el panel
  const toggleOpen = () => {
    setOpen((prev) => !prev);
  };

  // Cuando se abre por primera vez, pedimos el saludo a /agent
  useEffect(() => {
    const loadGreeting = async () => {
      if (!open || hasLoadedGreeting || messages.length > 0) return;

      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const { data } = await api.get("/agent", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const text =
          data?.message ?? "Hola, soy el asistente de PlanifyMe 😊";

        setMessages([
          {
            id: Date.now(),
            from: "bot",
            text,
          },
        ]);
        setHasLoadedGreeting(true);
      } catch (err) {
        console.error("Error obteniendo saludo del agente", err);
      }
    };

    loadGreeting();
  }, [open, hasLoadedGreeting, messages.length]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          from: "bot",
          text: "Tu sesión ha expirado. Vuelve a iniciar sesión para usar el asistente.",
        },
      ]);
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now(),
      from: "user",
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await api.post(
        "/agent/get_response",
        { user_query: trimmed },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const botText =
        data?.response ??
        "He procesado tu solicitud, pero no recibí un mensaje claro del agente.";

      const botMsg: ChatMessage = {
        id: Date.now() + 1,
        from: "bot",
        text: botText,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Error llamando al agente", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          from: "bot",
          text: "Ocurrió un error al hablar con el asistente. Intenta nuevamente en unos segundos.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading) {
        sendMessage();
      }
    }
  };

  return (
    <>
      {/* Botón flotante con el robot */}
      <button
        type="button"
        className="chatbot-toggle"
        onClick={toggleOpen}
        aria-label="Abrir asistente PlanifyMe"
      >
        <img src={chatbotIcon} alt="Bot PlanifyMe" />
      </button>

      {/* Panel de conversación */}
      {open && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <div className="chatbot-header-text">
              <strong>Asistente PlanifyMe</strong>
              <span>Explícame cómo quieres tu horario</span>
            </div>
            <button
              type="button"
              className="chatbot-close-btn"
              onClick={toggleOpen}
            >
              ✕
            </button>
          </div>

          <div className="chatbot-body">
            {messages.length === 0 && (
              <div className="chatbot-placeholder">
                ✨ Escribe algo como: <br />
                <em>
                  “Quiero estudiar de lunes a viernes de 8 a 12, dejando martes
                  libre”
                </em>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={
                  "chatbot-message " +
                  (m.from === "user"
                    ? "chatbot-message-user"
                    : "chatbot-message-bot")
                }
              >
                <ReactMarkdown>{m.text}</ReactMarkdown>
              </div>
            ))}

            {loading && (
              <div className="chatbot-message chatbot-message-bot">
                Generando propuesta de horario…
              </div>
            )}
          </div>

          <div className="chatbot-footer">
            <input
              type="text"
              className="chatbot-input"
              placeholder="Cuéntame cómo quieres tu horario..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              type="button"
              className="chatbot-send-btn"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
            >
              Enviar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

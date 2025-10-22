// src/components/TopBar.tsx
import { Navbar, Container, Nav, NavDropdown } from "react-bootstrap";
import chatbotLogo from "../Imagenes/chatbot.png";
import "../index.css";

type TopBarProps = {
  onProfileClick?: () => void; // 👈 nueva prop opcional
  onLogoutClick?: () => void;
};

export default function TopBar({ onProfileClick, onLogoutClick }: TopBarProps) {
  return (
    <Navbar bg="white" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand href="#">
          <img
            src={chatbotLogo}
            alt="Chatbot Logo"
            className="chatbot-logo-header"
          />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="nav" />
        <Navbar.Collapse id="nav">
          <Nav className="me-auto" />

          <Nav>
            <NavDropdown title="Perfil" align="end">
              {/* 👇 ahora este botón llama a la función que viene del Dashboard */}
              <NavDropdown.Item onClick={onProfileClick}>
                Ver perfil
              </NavDropdown.Item>
              
              <NavDropdown.Item>Configuración</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item>Ayuda</NavDropdown.Item>
              <NavDropdown.Item onClick={onLogoutClick}>Cerrar sesión</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap';

export default function TopBar() {
  return (
    <Navbar bg="white" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand href="#">
          <img src="/vite.svg" alt="logo" height={24} className="me-2" />
          Mi App
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="nav" />
        <Navbar.Collapse id="nav">
          <Nav className="me-auto" />
          <Nav>
            <NavDropdown title="Perfil" align="end">
              <NavDropdown.Item>Ver perfil</NavDropdown.Item>
              <NavDropdown.Item>Configuración</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item>Ayuda</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

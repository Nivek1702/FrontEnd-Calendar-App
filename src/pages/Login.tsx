import { api } from "../api";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";

export default function Login() {
  const nav = useNavigate();
  const [user, setUser] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post("/users/login_user", { username: user, password: pwd });
      if (data === true) {
        // navega a dashboard
        nav("/dashboard"); // si usas react-router
      } else {
       setError("Credenciales inválidas");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center bg-light">
      <Row className="w-100 justify-content-center">
        <Col xs={11} sm={8} md={6} lg={4}>
          <Card className="shadow-lg rounded-4">
            <Card.Body className="p-4">
              <h3 className="text-center mb-4 fw-bold">Iniciar sesión</h3>

              <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Usuario</Form.Label>
                  <Form.Control type="user" value={user} onChange={e=>setUser(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control type="password" value={pwd} onChange={e=>setPwd(e.target.value)} required />
                </Form.Group>
                 {error && <p className="text-danger mt-2">{error}</p>}
                <Button type="submit" variant="primary" className="w-100">Ingresar {loading ? "Ingresando..." : "Ingresar"}</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

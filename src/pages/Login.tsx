import { api } from "../api";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    try {
      const res = await api.post("/api/auth/login", { email, password: pwd });
      if ("access_token" in res.data) {
        localStorage.setItem("token", res.data.access_token);
        nav("/dashboard");
      } else {
        setErr(res.data.detail ?? "Credenciales inválidas");
      }
    } catch (error: any) {
      setErr(error?.response?.data?.detail ?? "Error de conexión");
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
                  <Form.Label>Correo</Form.Label>
                  <Form.Control type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control type="password" value={pwd} onChange={e=>setPwd(e.target.value)} required />
                </Form.Group>
                {err && <div className="text-danger mb-3">{err}</div>}
                <Button type="submit" variant="primary" className="w-100">Ingresar</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

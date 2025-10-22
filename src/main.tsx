// src/main.tsx
import 'bootstrap/dist/css/bootstrap.min.css';
import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginF from "./pages/LoginF";  
import Register from "./pages/Register";
import ForgotPassword from './pages/forgot-password';
import ResetPassword from './pages/reset-password';
import VerificarUsuario from "./pages/VerificarUsuario";
import VerificarUsuarioLogin from "./pages/VerificarUsuarioLogin";
// 👉 carga perezosa
const Dashboard = lazy(() => import('./pages/Dashboard'));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      {/* fallback mientras carga el Dashboard */}
      <Suspense fallback={<div style={{padding:16}}>Cargando…</div>}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<LoginF />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} /> 
          <Route path="/verify" element={<VerificarUsuario />} />
          <Route path="/VerificarUsuarioLogin" element={<VerificarUsuarioLogin />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>
);
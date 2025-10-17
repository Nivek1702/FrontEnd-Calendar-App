// src/main.tsx
import 'bootstrap/dist/css/bootstrap.min.css';
import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginF from "./pages/LoginF";  
import Register from "./pages/Register";

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
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>
);
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Componentes de autenticación
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Componentes protegidos
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';

// Componentes de empleados (NUEVOS)
import RegisterEmployee from './pages/RegisterEmployee';
import EmployeesDashboard from './pages/EmployeesDashboard';
import EmployeeDetail from './pages/EmployeeDetail';
import OnboardingCalendar from './pages/OnboardingCalendar';

// Estilos globales
import './styles/global.css';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Rutas protegidas */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Rutas de empleados */}
            <Route
              path="/dashboard/employees"
              element={
                <ProtectedRoute>
                  <EmployeesDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/employees/new"
              element={
                <ProtectedRoute>
                  <RegisterEmployee />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/employees/:id"
              element={
                <ProtectedRoute>
                  <EmployeeDetail />
                </ProtectedRoute>
              }
            />

            {/* Ruta del calendario */}
            <Route
              path="/dashboard/calendar"
              element={
                <ProtectedRoute>
                  <OnboardingCalendar />
                </ProtectedRoute>
              }
            />

            {/* Redirecciones */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
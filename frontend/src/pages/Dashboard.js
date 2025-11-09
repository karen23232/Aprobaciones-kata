import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Sistema de Aprobaciones</h1>
          <div className="user-menu">
            <div className="user-info">
              <span className="user-name">{user?.nombre}</span>
              <span className="user-role">{user?.rol}</span>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-card">
          <div className="welcome-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h2>¡Bienvenido, {user?.nombre}!</h2>
          <p>Has iniciado sesión exitosamente en el Sistema de Flujo de Aprobaciones.</p>
          <div className="user-details">
            <div className="detail-item">
              <strong>Email:</strong>
              <span>{user?.email}</span>
            </div>
            <div className="detail-item">
              <strong>Rol:</strong>
              <span className={`role-badge role-${user?.rol}`}>{user?.rol}</span>
            </div>
            <div className="detail-item">
              <strong>Miembro desde:</strong>
              <span>{new Date(user?.created_at).toLocaleDateString('es-ES')}</span>
            </div>
          </div>
        </div>

        <div className="info-card">
          <h3>🚀 Próximos pasos</h3>
          <p>Esta es la pantalla principal del dashboard. Aquí se implementarán las funcionalidades de:</p>
          <ul>
            <li>✅ Crear solicitudes de aprobación</li>
            <li>✅ Ver solicitudes pendientes</li>
            <li>✅ Aprobar/rechazar solicitudes</li>
            <li>✅ Historial de decisiones</li>
            <li>✅ Notificaciones</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
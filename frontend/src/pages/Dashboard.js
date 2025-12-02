import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import employeeService from '../services/employeeservice';
import StatsCard from '../components/StatsCard';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import ThemeToggle from '../components/ThemeToggle';
import '../styles/Dashboard.css';

// Logo del banco
const BancoLogo = '/assets/images/Logo.png';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStats, setShowStats] = useState(true); // Mostrar por defecto

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const statsData = await employeeService.getDashboardStats();
      setStats(statsData.data);
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <img src={BancoLogo} alt="Banco de Bogotá" className="bank-logo" />
            <h1>Sistema de Gestión de Onboarding</h1>
          </div>
          
          <div className="header-right">
            {/* 🌙 Botón de Tema */}
            <ThemeToggle />

            {/* Usuario */}
            <div className="user-menu">
              <div className="user-info">
                <span className="user-name">{user?.nombre || user?.username}</span>
                <span className="user-role">{user?.rol || 'Usuario'}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-secondary">
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Bienvenida */}
        <div className="welcome-section">
          <h2>¡Bienvenido, {user?.nombre || user?.username}!</h2>
          <p>Gestiona el onboarding de nuevos colaboradores</p>
        </div>

        {/* 📊 Botón para Ver/Ocultar Estadísticas */}
        <button
          className={`stats-toggle-btn ${showStats ? 'active' : ''}`}
          onClick={() => setShowStats(!showStats)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
          <span>{showStats ? 'Ocultar Estadísticas' : 'Ver Estadísticas'}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        {/* Estadísticas */}
        {showStats && stats && (
          <div className="stats-grid">
            <StatsCard
              title="Total Colaboradores"
              value={stats.totalEmployees || 0}
              color="primary"
              onClick={() => navigate('/dashboard/employees')}
            />
            <StatsCard
              title="Onboarding Completado"
              value={stats.bothCompleted || 0}
              subtitle={`${stats.percentageComplete || 0}% del total`}
              color="success"
              onClick={() => navigate('/dashboard/employees?status=completed')}
            />
            <StatsCard
              title="Pendientes"
              value={stats.pending || 0}
              color="warning"
              onClick={() => navigate('/dashboard/employees?status=pending')}
            />
            <StatsCard
              title="Próximos 14 días"
              value={stats.upcomingOnboardings || 0}
              subtitle="Onboardings técnicos"
              color="info"
              onClick={() => navigate('/dashboard/calendar')}
            />
          </div>
        )}

        {/* Acciones Rápidas */}
        <Card className="quick-actions">
          <h3>Acciones Rápidas</h3>
          <div className="actions-grid">
            {/* Card 1: Nuevo Colaborador */}
            <div
              className="action-card action-card-primary"
              onClick={() => navigate('/dashboard/employees/new')}
            >
              <div className="action-card-image">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
              </div>
              <div className="action-card-content">
                <h4 className="action-card-title">Nuevo Colaborador</h4>
                <p className="action-card-description">Registrar un nuevo colaborador en el sistema</p>
              </div>
            </div>

            {/* Card 2: Ver Colaboradores */}
            <div
              className="action-card action-card-secondary"
              onClick={() => navigate('/dashboard/employees')}
            >
              <div className="action-card-image">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div className="action-card-content">
                <h4 className="action-card-title">Ver Colaboradores</h4>
                <p className="action-card-description">Consulta la lista completa de colaboradores</p>
              </div>
            </div>

            {/* Card 3: Calendario */}
            <div
              className="action-card action-card-accent"
              onClick={() => navigate('/dashboard/calendar')}
            >
              <div className="action-card-image">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <div className="action-card-content">
                <h4 className="action-card-title">Calendario</h4>
                <p className="action-card-description">Ver calendario de onboardings técnicos</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Detalles de Progreso - NUEVO */}
        {stats && (
          <Card>
            <h3>📈 Progreso de Onboarding</h3>
            <div className="progress-details">
              <div className="progress-item">
                <div className="progress-header">
                  <span className="progress-label">
                    <span className="progress-icon">👋</span>
                    Onboarding General
                  </span>
                  <span className="progress-value">
                    {stats.generalCompleted} / {stats.totalEmployees}
                  </span>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar progress-bar-success"
                    style={{ 
                      width: `${stats.totalEmployees > 0 
                        ? (stats.generalCompleted / stats.totalEmployees) * 100 
                        : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="progress-percentage">
                  {stats.totalEmployees > 0 
                    ? Math.round((stats.generalCompleted / stats.totalEmployees) * 100) 
                    : 0}% completado
                </span>
              </div>

              <div className="progress-item">
                <div className="progress-header">
                  <span className="progress-label">
                    <span className="progress-icon">🎯</span>
                    Onboarding Técnico
                  </span>
                  <span className="progress-value">
                    {stats.technicalCompleted} / {stats.totalEmployees}
                  </span>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar progress-bar-info"
                    style={{ 
                      width: `${stats.totalEmployees > 0 
                        ? (stats.technicalCompleted / stats.totalEmployees) * 100 
                        : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="progress-percentage">
                  {stats.totalEmployees > 0 
                    ? Math.round((stats.technicalCompleted / stats.totalEmployees) * 100) 
                    : 0}% completado
                </span>
              </div>

              <div className="progress-item">
                <div className="progress-header">
                  <span className="progress-label">
                    <span className="progress-icon">✅</span>
                    Onboarding Completo
                  </span>
                  <span className="progress-value">
                    {stats.bothCompleted} / {stats.totalEmployees}
                  </span>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar progress-bar-primary"
                    style={{ 
                      width: `${stats.percentageComplete || 0}%` 
                    }}
                  ></div>
                </div>
                <span className="progress-percentage">
                  {stats.percentageComplete || 0}% completado
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Información Útil */}
        <Card>
          <h3>💡 Información Útil</h3>
          <div className="info-grid">
            <div className="info-item">
              <div className="info-icon">📋</div>
              <div className="info-content">
                <h4>Tipos de Onboarding</h4>
                <p>General (Bienvenida) y Técnico (Journey to Cloud, etc.)</p>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon">📧</div>
              <div className="info-content">
                <h4>Alertas Automáticas</h4>
                <p>Se envían una semana antes del onboarding técnico</p>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon">📅</div>
              <div className="info-content">
                <h4>Calendario</h4>
                <p>Visualiza las sesiones programadas por mes o año</p>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
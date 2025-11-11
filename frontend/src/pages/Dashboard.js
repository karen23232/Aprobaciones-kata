import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import requestService from '../services/requestService';
import notificationService from '../services/notificationService';
import StatsCard from '../components/StatsCard';
import Card from '../components/Card';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { formatRelativeTime, getStatusColor, getStatusIcon } from '../utils/formatters';
import '../styles/Dashboard.css';

// Logo del banco
const BancoLogo = '/assets/images/Logo.png';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [stats, setStats] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // 🔔 POLLING: Cargar datos iniciales y configurar actualización automática
  useEffect(() => {
    loadDashboardData();
    
    // 🔔 Refrescar notificaciones cada 30 segundos
    const notificationInterval = setInterval(() => {
      refreshNotifications();
    }, 30000); // 30 segundos
    
    // Limpiar intervalo al desmontar el componente
    return () => {
      clearInterval(notificationInterval);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [statsData, requestsData, notificationsData, countData] = await Promise.all([
        requestService.getStats(),
        requestService.getAll({ limit: 5 }),
        notificationService.getAll(5),
        notificationService.getUnreadCount(),
      ]);

      setStats(statsData.data);
      setRecentRequests(requestsData.data.solicitudes);
      setNotifications(notificationsData.data);
      setUnreadCount(countData.data.count);
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🔔 NUEVA FUNCIÓN: Refrescar solo notificaciones (más eficiente)
  const refreshNotifications = async () => {
    try {
      const [notificationsData, countData] = await Promise.all([
        notificationService.getAll(5),
        notificationService.getUnreadCount(),
      ]);
      
      setNotifications(notificationsData.data);
      setUnreadCount(countData.data.count);
      
      // Log opcional para verificar que está funcionando (puedes quitarlo después)
      console.log('🔔 Notificaciones actualizadas:', countData.data.count, 'sin leer');
    } catch (error) {
      console.error('Error al refrescar notificaciones:', error);
      // No mostrar error al usuario, solo registrar en consola
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.leida) {
        await notificationService.markAsRead(notification.id);
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      if (notification.solicitud_id) {
        navigate(`/requests/${notification.solicitud_id}`);
      }
      setShowNotifications(false);
    } catch (error) {
      console.error('Error al marcar notificación:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, leida: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error al marcar notificaciones:', error);
    }
  };

  const getNotificationIcon = (tipo) => {
    switch (tipo) {
      case 'pendiente':
        return '⏳';
      case 'aprobado':
        return '✅';
      case 'rechazado':
        return '❌';
      default:
        return '🔔';
    }
  };

  const getNotificationClass = (tipo) => {
    switch (tipo) {
      case 'pendiente':
        return 'notification-pending';
      case 'aprobado':
        return 'notification-approved';
      case 'rechazado':
        return 'notification-rejected';
      default:
        return '';
    }
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
            <h1>Sistema de Aprobaciones</h1>
          </div>
          
          <div className="header-right">
            {/* Notificaciones */}
            <div className="notifications-wrapper">
              <button
                className="notification-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Notificaciones"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </button>

              {showNotifications && (
                <div className="notifications-dropdown">
                  <div className="notifications-header">
                    <h3>Notificaciones</h3>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllAsRead} className="mark-all-btn">
                        Marcar todas como leídas
                      </button>
                    )}
                  </div>
                  <div className="notifications-list">
                    {notifications.length === 0 ? (
                      <div className="no-notifications">
                        <p>No tienes notificaciones</p>
                      </div>
                    ) : (
                      notifications.map(notification => (
                        <div
                          key={notification.id}
                          className={`notification-item ${notification.leida ? 'read' : 'unread'} ${getNotificationClass(notification.tipo)}`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="notification-icon">
                            {getNotificationIcon(notification.tipo)}
                          </div>
                          <div className="notification-content">
                            <p className="notification-message">{notification.mensaje}</p>
                            <span className="notification-time">
                              {formatRelativeTime(notification.created_at)}
                            </span>
                          </div>
                          {!notification.leida && <div className="unread-dot"></div>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Usuario */}
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
        </div>
      </header>

      {/* Main Content con fondo */}
      <main className="dashboard-main">
        {/* Bienvenida */}
        <div className="welcome-section">
          <h2>¡Bienvenido, {user?.nombre}!</h2>
          <p>Aquí puedes gestionar tus solicitudes de aprobación</p>
        </div>

        {/* 📊 BOTÓN PARA VER ESTADÍSTICAS */}
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

        {/* Estadísticas - Solo se muestran si showStats es true */}
        {showStats && (
          <div className="stats-grid">
            <StatsCard
              title="Total Solicitudes"
              value={stats?.total || 0}
              icon="📊"
              color="primary"
            />
            <StatsCard
              title="Pendientes"
              value={stats?.pendientes || 0}
              icon="⏳"
              color="warning"
            />
            <StatsCard
              title="Aprobadas"
              value={stats?.aprobadas || 0}
              icon="✅"
              color="success"
            />
            <StatsCard
              title="Rechazadas"
              value={stats?.rechazadas || 0}
              icon="❌"
              color="danger"
            />
          </div>
        )}

        {/* Acciones Rápidas - NUEVO DISEÑO CON CARDS GRANDES */}
        <Card className="quick-actions">
          <h3>Acciones Rápidas</h3>
          <div className="actions-grid">
            {/* Card 1: Nueva Solicitud */}
            <div
              className="action-card action-card-primary"
              onClick={() => navigate('/requests/new')}
            >
              <div className="action-card-image">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <div className="action-card-content">
                <h4 className="action-card-title">Nueva Solicitud</h4>
                <p className="action-card-description">Crea una nueva solicitud de aprobación</p>
              </div>
            </div>

            {/* Card 2: Ver Todas */}
            <div
              className="action-card action-card-secondary"
              onClick={() => navigate('/requests')}
            >
              <div className="action-card-image">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <div className="action-card-content">
                <h4 className="action-card-title">Ver Todas</h4>
                <p className="action-card-description">Consulta todas tus solicitudes</p>
              </div>
            </div>

            {/* Card 3: Pendientes (solo para aprobadores) */}
            {(user?.rol === 'aprobador' || user?.rol === 'admin') && (
              <div
                className="action-card action-card-accent"
                onClick={() => navigate('/requests?estado=pendiente')}
              >
                <div className="action-card-image">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <div className="action-card-content">
                  <h4 className="action-card-title">Pendientes de Aprobar</h4>
                  <p className="action-card-description">Revisa y aprueba solicitudes</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Solicitudes Recientes */}
        <Card>
          <div className="section-header">
            <h3>Solicitudes Recientes</h3>
            <button
              className="btn-text"
              onClick={() => navigate('/requests')}
            >
              Ver todas →
            </button>
          </div>

          {recentRequests.length === 0 ? (
            <EmptyState
              icon="📋"
              title="No hay solicitudes"
              description="Aún no tienes solicitudes creadas"
              action={
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/requests/new')}
                >
                  Crear primera solicitud
                </button>
              }
            />
          ) : (
            <div className="requests-list">
              {recentRequests.map(request => (
                <div
                  key={request.id}
                  className="request-item"
                  onClick={() => navigate(`/requests/${request.id}`)}
                >
                  <div className="request-main">
                    <div className="request-header">
                      <h4 className="request-title">{request.titulo}</h4>
                      <Badge variant={getStatusColor(request.estado)}>
                        {getStatusIcon(request.estado)} {request.estado}
                      </Badge>
                    </div>
                    <p className="request-code">{request.codigo_unico}</p>
                    <p className="request-type">{request.tipo_nombre}</p>
                  </div>
                  <div className="request-meta">
                    <span className="request-time">
                      {formatRelativeTime(request.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
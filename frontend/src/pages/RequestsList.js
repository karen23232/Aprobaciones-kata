import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import requestService from '../services/requestService';
import Card from '../components/Card';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { formatRelativeTime, getStatusColor, getStatusIcon } from '../utils/formatters';
import '../styles/RequestsList.css';

const RequestsList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState(searchParams.get('estado') || 'todos');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadRequests();
  }, [selectedFilter]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const filters = {};
      
      if (selectedFilter !== 'todos') {
        filters.estado = selectedFilter;
      }

      const response = await requestService.getAll(filters);
      setRequests(response.data.solicitudes);
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    if (filter === 'todos') {
      searchParams.delete('estado');
    } else {
      searchParams.set('estado', filter);
    }
    setSearchParams(searchParams);
  };

  const filteredRequests = requests.filter(request => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      request.titulo.toLowerCase().includes(searchLower) ||
      request.codigo_unico.toLowerCase().includes(searchLower) ||
      request.tipo_nombre.toLowerCase().includes(searchLower)
    );
  });

  return (
    <>
      {/* HEADER CON COLORES BANCO DE BOGOTÁ Y LOGO */}
      <div className="page-header">
        <div className="header-content">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Volver
          </button>
          
          <img 
            src="/assets/images/Logo.png" 
            alt="Banco de Bogotá" 
            className="bank-logo"
          />
          
          <h1>Solicitudes</h1>
          
          <button
            className="btn btn-primary"
            onClick={() => navigate('/requests/new')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Nueva Solicitud
          </button>
        </div>
      </div>

      <div className="requests-page">
        <div className="page-content">
          <Card>
            {/* Filtros y Búsqueda */}
            <div className="filters-section">
              <div className="filter-tabs">
                <button
                  className={`filter-tab ${selectedFilter === 'todos' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('todos')}
                >
                  Todas
                </button>
                <button
                  className={`filter-tab ${selectedFilter === 'pendiente' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('pendiente')}
                >
                  Pendientes
                </button>
                <button
                  className={`filter-tab ${selectedFilter === 'aprobado' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('aprobado')}
                >
                  Aprobadas
                </button>
                <button
                  className={`filter-tab ${selectedFilter === 'rechazado' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('rechazado')}
                >
                  Rechazadas
                </button>
              </div>

              <div className="search-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                  type="text"
                  placeholder="Buscar por título, código o tipo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Lista de Solicitudes */}
            {loading ? (
              <div className="loading-container">
                <LoadingSpinner size="large" />
              </div>
            ) : filteredRequests.length === 0 ? (
              <EmptyState
                icon="📋"
                title="No se encontraron solicitudes"
                description={searchTerm ? 'Intenta con otros términos de búsqueda' : 'Aún no tienes solicitudes'}
                action={
                  !searchTerm && (
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate('/requests/new')}
                    >
                      Crear primera solicitud
                    </button>
                  )
                }
              />
            ) : (
              <div className="requests-table">
                {filteredRequests.map(request => (
                  <div
                    key={request.id}
                    className="request-row"
                    onClick={() => navigate(`/requests/${request.id}`)}
                  >
                    <div className="request-info">
                      <div className="request-main-info">
                        <h3 className="request-title-table">{request.titulo}</h3>
                        <span className="request-code-table">{request.codigo_unico}</span>
                      </div>
                      <div className="request-meta-info">
                        <span className="request-type-table">{request.tipo_nombre}</span>
                        <span className="request-separator">•</span>
                        <span className="request-user">{request.solicitante_nombre}</span>
                        <span className="request-separator">•</span>
                        <span className="request-date">{formatRelativeTime(request.created_at)}</span>
                      </div>
                    </div>
                    <div className="request-status">
                      <Badge variant={getStatusColor(request.estado)}>
                        {getStatusIcon(request.estado)} {request.estado}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
};

export default RequestsList;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import employeeService from '../services/employeeservice';
import StatusBadge from '../components/Statusbadge';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/Employeesdashboard.css';

const EmployeesDashboard = () => {
  const navigate = useNavigate();
  
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para filtros y búsqueda
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    sortBy: 'entryDate',
    order: 'DESC',
    page: 1,
    limit: 10
  });
  
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    page: 1
  });

  // Cargar empleados
  useEffect(() => {
    loadEmployees();
  }, [filters]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await employeeService.getAllEmployees(filters);
      
      setEmployees(response.data);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Error al cargar empleados:', err);
      setError('Error al cargar los colaboradores. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Resetear a la primera página al cambiar filtros
    }));
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setFilters(prev => ({
      ...prev,
      search: value,
      page: 1
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleCompleteOnboarding = async (employeeId, type) => {
    try {
      if (type === 'general') {
        await employeeService.completeGeneralOnboarding(employeeId);
      } else {
        await employeeService.completeTechnicalOnboarding(employeeId);
      }
      
      // Recargar lista
      await loadEmployees();
    } catch (err) {
      console.error('Error al completar onboarding:', err);
      alert('Error al actualizar el estado del onboarding');
    }
  };

  const handleViewDetail = (employeeId) => {
    navigate(`/dashboard/employees/${employeeId}`);
  };

  const handleNewEmployee = () => {
    navigate('/dashboard/employees/new');
  };

  const getOnboardingStatus = (employee) => {
    if (employee.generalOnboardingStatus && employee.technicalOnboardingStatus) {
      return { text: 'Completado', status: 'completed', icon: '✓' };
    } else if (!employee.generalOnboardingStatus && !employee.technicalOnboardingStatus) {
      return { text: 'Pendiente', status: 'warning', icon: '⏳' };
    } else {
      return { text: 'En proceso', status: 'pending', icon: '🔄' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No asignada';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading && employees.length === 0) {
    return <LoadingSpinner message="Cargando colaboradores..." />;
  }

  return (
    <div className="employees-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Gestión de Colaboradores</h1>
          <p className="subtitle">Administra el onboarding de nuevos colaboradores</p>
        </div>
        <button onClick={handleNewEmployee} className="btn-new-employee">
          + Nuevo Colaborador
        </button>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="filters-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre, correo, cargo o departamento..."
            value={filters.search}
            onChange={handleSearch}
            className="search-input"
          />
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filters.status === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('status', 'all')}
          >
            Todos ({pagination.total})
          </button>
          <button
            className={`filter-btn ${filters.status === 'pending' ? 'active' : ''}`}
            onClick={() => handleFilterChange('status', 'pending')}
          >
            Pendientes
          </button>
          <button
            className={`filter-btn ${filters.status === 'completed' ? 'active' : ''}`}
            onClick={() => handleFilterChange('status', 'completed')}
          >
            Completados
          </button>
          <button
            className={`filter-btn ${filters.status === 'general-completed' ? 'active' : ''}`}
            onClick={() => handleFilterChange('status', 'general-completed')}
          >
            General ✓
          </button>
          <button
            className={`filter-btn ${filters.status === 'technical-completed' ? 'active' : ''}`}
            onClick={() => handleFilterChange('status', 'technical-completed')}
          >
            Técnico ✓
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Tabla de Empleados */}
      {employees.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No se encontraron colaboradores</h3>
          <p>
            {filters.search || filters.status !== 'all'
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Comienza registrando tu primer colaborador'}
          </p>
          <button onClick={handleNewEmployee} className="btn-primary">
            Registrar Colaborador
          </button>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="employees-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Fecha Ingreso</th>
                  <th>Cargo</th>
                  <th>Onboarding General</th>
                  <th>Onboarding Técnico</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(employee => {
                  const status = getOnboardingStatus(employee);
                  return (
                    <tr key={employee.id}>
                      <td className="employee-name">
                        <div className="name-cell">
                          <span className="avatar">
                            {employee.fullName.charAt(0).toUpperCase()}
                          </span>
                          <span>{employee.fullName}</span>
                        </div>
                      </td>
                      <td className="employee-email">{employee.email}</td>
                      <td>{formatDate(employee.entryDate)}</td>
                      <td>{employee.position || '-'}</td>
                      <td className="status-cell">
                        {employee.generalOnboardingStatus ? (
                          <StatusBadge status="completed" text="Completado" icon="✓" />
                        ) : (
                          <button
                            onClick={() => handleCompleteOnboarding(employee.id, 'general')}
                            className="btn-complete"
                          >
                            Marcar ✓
                          </button>
                        )}
                      </td>
                      <td className="status-cell">
                        {employee.technicalOnboardingStatus ? (
                          <StatusBadge status="completed" text="Completado" icon="✓" />
                        ) : (
                          <button
                            onClick={() => handleCompleteOnboarding(employee.id, 'technical')}
                            className="btn-complete"
                          >
                            Marcar ✓
                          </button>
                        )}
                      </td>
                      <td>
                        <StatusBadge
                          status={status.status}
                          text={status.text}
                          icon={status.icon}
                        />
                      </td>
                      <td className="actions-cell">
                        <button
                          onClick={() => handleViewDetail(employee.id)}
                          className="btn-view"
                          title="Ver detalles"
                        >
                          👁️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="pagination-btn"
              >
                ← Anterior
              </button>
              
              <span className="pagination-info">
                Página {pagination.page} de {pagination.pages}
              </span>
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="pagination-btn"
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EmployeesDashboard;
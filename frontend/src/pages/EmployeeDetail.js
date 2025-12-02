import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import employeeService from '../services/employeeservice';
import alertService from '../services/alertservice';
import StatusBadge from '../components/Statusbadge';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import '../styles/EmployeeDetail.css';

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    loadEmployee();
  }, [id]);

  const loadEmployee = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await employeeService.getEmployeeById(id);
      setEmployee(response.data);
      setEditForm(response.data);
    } catch (err) {
      console.error('Error al cargar colaborador:', err);
      setError('Error al cargar el colaborador');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEdit = async () => {
    try {
      setActionLoading(true);
      await employeeService.updateEmployee(id, editForm);
      await loadEmployee();
      setIsEditing(false);
      alert('Colaborador actualizado exitosamente');
    } catch (err) {
      console.error('Error al actualizar:', err);
      alert('Error al actualizar el colaborador');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm(employee);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await employeeService.deleteEmployee(id);
      navigate('/dashboard/employees');
    } catch (err) {
      console.error('Error al eliminar:', err);
      alert('Error al eliminar el colaborador');
      setActionLoading(false);
    }
  };

  const handleCompleteOnboarding = async (type) => {
    try {
      setActionLoading(true);
      if (type === 'general') {
        await employeeService.completeGeneralOnboarding(id);
      } else {
        await employeeService.completeTechnicalOnboarding(id);
      }
      await loadEmployee();
    } catch (err) {
      console.error('Error al completar onboarding:', err);
      alert('Error al actualizar el onboarding');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendAlert = async () => {
    try {
      setActionLoading(true);
      await alertService.sendManualAlert(id);
      alert('Alerta enviada exitosamente');
    } catch (err) {
      console.error('Error al enviar alerta:', err);
      alert('Error al enviar la alerta');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No asignada';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <LoadingSpinner message="Cargando información del colaborador..." />;
  }

  if (error || !employee) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h2>Error</h2>
        <p>{error || 'No se encontró el colaborador'}</p>
        <button onClick={() => navigate('/dashboard/employees')} className="btn-primary">
          Volver al listado
        </button>
      </div>
    );
  }

  const technicalOnboardingTypes = [
    'Journey to Cloud',
    'DevOps Fundamentals',
    'Security Basics',
    'Architecture Principles',
    'Otro'
  ];

  return (
    <div className="employee-detail-container">
      {/* Header */}
      <div className="detail-header">
        <button onClick={() => navigate('/dashboard/employees')} className="back-button">
          ← Volver al listado
        </button>
        
        <div className="header-actions">
          {!isEditing ? (
            <>
              <button onClick={() => setIsEditing(true)} className="btn-edit">
                ✏️ Editar
              </button>
              <button onClick={() => setShowDeleteModal(true)} className="btn-delete">
                🗑️ Eliminar
              </button>
            </>
          ) : (
            <>
              <button onClick={handleCancelEdit} className="btn-cancel" disabled={actionLoading}>
                Cancelar
              </button>
              <button onClick={handleSaveEdit} className="btn-save" disabled={actionLoading}>
                {actionLoading ? 'Guardando...' : '💾 Guardar'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Información Principal */}
      <div className="detail-card main-info-card">
        <div className="card-header">
          <div className="employee-avatar-large">
            {employee.fullName.charAt(0).toUpperCase()}
          </div>
          <div className="employee-title-info">
            {isEditing ? (
              <input
                type="text"
                name="fullName"
                value={editForm.fullName}
                onChange={handleEditChange}
                className="edit-input-large"
              />
            ) : (
              <h1>{employee.fullName}</h1>
            )}
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleEditChange}
                className="edit-input"
              />
            ) : (
              <p className="employee-email-large">{employee.email}</p>
            )}
          </div>
        </div>

        <div className="info-grid">
          <div className="info-item">
            <label>📅 Fecha de Ingreso</label>
            {isEditing ? (
              <input
                type="date"
                name="entryDate"
                value={editForm.entryDate}
                onChange={handleEditChange}
                className="edit-input"
              />
            ) : (
              <p>{formatDate(employee.entryDate)}</p>
            )}
          </div>

          <div className="info-item">
            <label>💼 Cargo</label>
            {isEditing ? (
              <input
                type="text"
                name="position"
                value={editForm.position || ''}
                onChange={handleEditChange}
                className="edit-input"
                placeholder="Ej: Desarrollador Full Stack"
              />
            ) : (
              <p>{employee.position || 'No especificado'}</p>
            )}
          </div>

          <div className="info-item">
            <label>🏢 Departamento</label>
            {isEditing ? (
              <input
                type="text"
                name="department"
                value={editForm.department || ''}
                onChange={handleEditChange}
                className="edit-input"
                placeholder="Ej: Tecnología"
              />
            ) : (
              <p>{employee.department || 'No especificado'}</p>
            )}
          </div>

          <div className="info-item">
            <label>🕒 Registrado</label>
            <p>{formatDateTime(employee.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Estado de Onboardings */}
      <div className="detail-card onboarding-status-card">
        <h2>📊 Estado de Onboarding</h2>
        
        <div className="onboarding-items">
          {/* Onboarding General */}
          <div className="onboarding-item">
            <div className="onboarding-header">
              <h3>👋 Onboarding de Bienvenida General</h3>
              {employee.generalOnboardingStatus ? (
                <StatusBadge status="completed" text="Completado" icon="✓" />
              ) : (
                <StatusBadge status="pending" text="Pendiente" icon="⏳" />
              )}
            </div>
            {!employee.generalOnboardingStatus && !isEditing && (
              <button
                onClick={() => handleCompleteOnboarding('general')}
                className="btn-complete-onboarding"
                disabled={actionLoading}
              >
                Marcar como completado ✓
              </button>
            )}
          </div>

          {/* Onboarding Técnico */}
          <div className="onboarding-item">
            <div className="onboarding-header">
              <h3>🎯 Onboarding Técnico</h3>
              {employee.technicalOnboardingStatus ? (
                <StatusBadge status="completed" text="Completado" icon="✓" />
              ) : (
                <StatusBadge status="pending" text="Pendiente" icon="⏳" />
              )}
            </div>
            
            <div className="technical-onboarding-details">
              <div className="info-item">
                <label>Tipo de Onboarding</label>
                {isEditing ? (
                  <select
                    name="technicalOnboardingType"
                    value={editForm.technicalOnboardingType || ''}
                    onChange={handleEditChange}
                    className="edit-input"
                  >
                    <option value="">Seleccione un tipo</option>
                    {technicalOnboardingTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                ) : (
                  <p>{employee.technicalOnboardingType || 'No especificado'}</p>
                )}
              </div>

              <div className="info-item">
                <label>Fecha Programada</label>
                {isEditing ? (
                  <input
                    type="date"
                    name="technicalOnboardingDate"
                    value={editForm.technicalOnboardingDate || ''}
                    onChange={handleEditChange}
                    className="edit-input"
                  />
                ) : (
                  <p>{formatDate(employee.technicalOnboardingDate)}</p>
                )}
              </div>
            </div>

            {!employee.technicalOnboardingStatus && !isEditing && (
              <div className="onboarding-actions">
                <button
                  onClick={() => handleCompleteOnboarding('technical')}
                  className="btn-complete-onboarding"
                  disabled={actionLoading}
                >
                  Marcar como completado ✓
                </button>
                {employee.technicalOnboardingDate && (
                  <button
                    onClick={handleSendAlert}
                    className="btn-send-alert"
                    disabled={actionLoading}
                  >
                    📧 Enviar Alerta
                  </button>
                )}
              </div>
            )}

            {employee.alertSent && (
              <div className="alert-info">
                <span className="alert-badge">✅ Alerta enviada</span>
                <span className="alert-date">
                  {formatDateTime(employee.alertSentDate)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notas */}
      <div className="detail-card notes-card">
        <h2>📝 Notas Adicionales</h2>
        {isEditing ? (
          <textarea
            name="notes"
            value={editForm.notes || ''}
            onChange={handleEditChange}
            className="edit-textarea"
            rows={6}
            placeholder="Observaciones sobre el colaborador o su proceso de onboarding..."
          />
        ) : (
          <p className="notes-content">
            {employee.notes || 'No hay notas adicionales'}
          </p>
        )}
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteModal && (
        <Modal onClose={() => setShowDeleteModal(false)}>
          <div className="delete-modal">
            <div className="delete-modal-icon">⚠️</div>
            <h2>¿Eliminar Colaborador?</h2>
            <p>
              ¿Estás seguro de que deseas eliminar a <strong>{employee.fullName}</strong>?
              Esta acción no se puede deshacer.
            </p>
            <div className="delete-modal-actions">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-cancel"
                disabled={actionLoading}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="btn-confirm-delete"
                disabled={actionLoading}
              >
                {actionLoading ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default EmployeeDetail;
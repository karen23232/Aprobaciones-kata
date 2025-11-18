import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import requestService from '../services/requestService';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDateTime, formatRelativeTime, getStatusColor, getStatusIcon } from '../utils/formatters';
import '../styles/RequestDetail.css';

const RequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [request, setRequest] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal de aprobar/rechazar
  const [showActionModal, setShowActionModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [comment, setComment] = useState('');
  
  // Modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    titulo: '',
    descripcion: '',
    tipo_solicitud_id: '',
    responsable_id: ''
  });
  const [requestTypes, setRequestTypes] = useState([]);
  const [approvers, setApprovers] = useState([]);
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadRequestData();
    loadFormData();
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setTimeout(() => setSuccessMessage(''), 5000);
      window.history.replaceState({}, document.title);
    }
  }, [id]);

  const loadRequestData = async () => {
    try {
      setLoading(true);
      const response = await requestService.getById(id);
      setRequest(response.data.solicitud);
      setHistory(response.data.historial);
      
      // Pre-cargar datos para edición
      setEditData({
        titulo: response.data.solicitud.titulo,
        descripcion: response.data.solicitud.descripcion,
        tipo_solicitud_id: response.data.solicitud.tipo_solicitud_id,
        responsable_id: response.data.solicitud.responsable_id
      });
    } catch (error) {
      console.error('Error al cargar solicitud:', error);
      setError(error.message || 'Error al cargar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const loadFormData = async () => {
    try {
      const [typesRes, approversRes] = await Promise.all([
        requestService.getTypes(),
        requestService.getApprovers()
      ]);
      setRequestTypes(typesRes.data);
      setApprovers(approversRes.data);
    } catch (error) {
      console.error('Error al cargar datos del formulario:', error);
    }
  };

  const canApprove = () => {
    if (!request || !user) return false;
    return (
      request.estado === 'pendiente' &&
      (user.rol === 'admin' || request.responsable_id === user.id)
    );
  };

  const canEdit = () => {
    if (!request || !user) return false;
    return (
      request.estado === 'pendiente' &&
      request.solicitante_id === user.id
    );
  };

  const handleOpenActionModal = (action) => {
    setModalAction(action);
    setComment('');
    setShowActionModal(true);
  };

  const handleCloseActionModal = () => {
    setShowActionModal(false);
    setModalAction(null);
    setComment('');
  };

  const handleSubmitAction = async () => {
    if (!comment.trim() && modalAction === 'rechazado') {
      setError('Debes proporcionar un motivo para rechazar');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await requestService.updateStatus(id, {
        estado: modalAction,
        comentario: comment.trim() || (modalAction === 'aprobado' ? 'Aprobado sin comentarios' : '')
      });

      await loadRequestData();
      handleCloseActionModal();
      setSuccessMessage(
        modalAction === 'aprobado'
          ? '✅ Solicitud aprobada exitosamente'
          : '❌ Solicitud rechazada'
      );
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error al actualizar solicitud:', error);
      setError(error.message || 'Error al actualizar la solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEditModal = () => {
    setEditData({
      titulo: request.titulo,
      descripcion: request.descripcion,
      tipo_solicitud_id: request.tipo_solicitud_id,
      responsable_id: request.responsable_id
    });
    setError('');
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setError('');
  };

  const handleEditChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    
    if (!editData.titulo.trim()) {
      setError('El título es requerido');
      return;
    }
    
    if (!editData.descripcion.trim()) {
      setError('La descripción es requerida');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await requestService.update(id, editData);
      await loadRequestData();
      handleCloseEditModal();
      setSuccessMessage('✅ Solicitud actualizada exitosamente');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error al actualizar solicitud:', error);
      setError(error.message || 'Error al actualizar la solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  // 🆕 FUNCIÓN MEJORADA PARA MOSTRAR DETALLES DE CAMBIOS
  const renderHistoryDetails = (item) => {
    if (item.accion === 'editar' && item.comentario) {
      // Si el comentario tiene el formato "Solicitud editada: cambio1, cambio2..."
      if (item.comentario.startsWith('Solicitud editada:')) {
        const detallesCompletos = item.comentario.replace('Solicitud editada: ', '');
        const cambios = detallesCompletos.split(', ');
        
        return (
          <div className="history-changes">
            <p className="history-comment">
              <strong>Cambios realizados:</strong>
            </p>
            <ul className="changes-list">
              {cambios.map((cambio, index) => (
                <li key={index} className="change-item">
                  {cambio}
                </li>
              ))}
            </ul>
          </div>
        );
      }
      
      // Si es un comentario simple de edición
      if (item.comentario === 'Solicitud editada' || item.comentario === 'Solicitud editada sin cambios') {
        return (
          <p className="history-comment">
            <strong>Solicitud editada</strong>
          </p>
        );
      }
    }
    
    // Para comentarios de aprobación/rechazo
    if (item.comentario && (item.accion === 'aprobado' || item.accion === 'rechazado')) {
      return (
        <p className="history-comment">
          <strong>Comentario:</strong> {item.comentario}
        </p>
      );
    }
    
    // Para cualquier otro comentario
    if (item.comentario) {
      return (
        <p className="history-comment">{item.comentario}</p>
      );
    }
    
    return null;
  };

  if (loading) {
    return (
      <>
        <div className="page-header">
          <div className="header-content">
            <img 
              src="/assets/images/Logo.png" 
              alt="Banco de Bogotá" 
              className="bank-logo"
            />
            <h1>Cargando...</h1>
          </div>
        </div>
        <div className="request-detail-page">
          <LoadingSpinner fullScreen />
        </div>
      </>
    );
  }

  if (!request) {
    return (
      <>
        <div className="page-header">
          <div className="header-content">
            <img 
              src="/assets/images/Logo.png" 
              alt="Banco de Bogotá" 
              className="bank-logo"
            />
            <h1>Solicitud no encontrada</h1>
          </div>
        </div>
        <div className="request-detail-page">
          <div className="page-content">
            <Card>
              <div className="error-state">
                <p>La solicitud que buscas no existe o no tienes permiso para verla.</p>
                <button className="btn btn-primary" onClick={() => navigate('/requests')}>
                  Volver a solicitudes
                </button>
              </div>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* HEADER CON COLORES BANCO DE BOGOTÁ Y LOGO */}
      <div className="page-header">
        <div className="header-content">
          <button className="back-btn" onClick={() => navigate('/requests')}>
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
          
          <h1>Detalle de Solicitud</h1>
        </div>
      </div>

      <div className="request-detail-page">
        <div className="page-content">
          {successMessage && (
            <div className="alert alert-success">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {successMessage}
            </div>
          )}

          <div className="detail-layout">
            {/* Columna Principal */}
            <div className="detail-main">
              {/* Header de la solicitud */}
              <Card>
                <div className="request-header-detail">
                  <div className="header-title-section">
                    <h2>{request.titulo}</h2>
                    <p className="request-code-detail">{request.codigo_unico}</p>
                  </div>
                  <Badge variant={getStatusColor(request.estado)} size="large">
                    {getStatusIcon(request.estado)} {request.estado.toUpperCase()}
                  </Badge>
                </div>

                {/* Botones de acción */}
                <div className="action-buttons-container">
                  {canEdit() && (
                    <button className="btn btn-secondary" onClick={handleOpenEditModal}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      Editar Solicitud
                    </button>
                  )}
                  
                  {canApprove() && (
                    <div className="approval-buttons">
                      <button className="btn btn-success" onClick={() => handleOpenActionModal('aprobado')}>
                        ✅ Aprobar Solicitud
                      </button>
                      <button className="btn btn-danger" onClick={() => handleOpenActionModal('rechazado')}>
                        ❌ Rechazar Solicitud
                      </button>
                    </div>
                  )}
                </div>
              </Card>

              {/* Descripción */}
              <Card>
                <h3 className="section-title">Descripción</h3>
                <p className="request-description">{request.descripcion}</p>
              </Card>

              {/* Historial Mejorado */}
              {history.length > 0 && (
                <Card>
                  <h3 className="section-title">Historial de Cambios</h3>
                  <div className="history-timeline">
                    {history.map((item, index) => (
                      <div key={item.id} className="history-item">
                        <div className="history-icon">
                          {item.accion === 'crear' && ''}
                          {item.accion === 'editar' && ''}
                          {item.accion === 'aprobado' && ''}
                          {item.accion === 'rechazado' && ''}
                        </div>
                        <div className="history-content">
                          <div className="history-header">
                            <span className="history-action">{item.accion.toUpperCase()}</span>
                            <span className="history-time">{formatRelativeTime(item.created_at)}</span>
                          </div>
                          <p className="history-user">{item.usuario_nombre}</p>
                          {renderHistoryDetails(item)}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Sidebar con información adicional */}
            <div className="detail-sidebar">
              <Card>
                <h3 className="section-title">Información</h3>
                
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Tipo de Solicitud</span>
                    <span className="info-value">{request.tipo_nombre}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Solicitante</span>
                    <span className="info-value">{request.solicitante_nombre}</span>
                    <span className="info-detail">{request.solicitante_email}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Responsable</span>
                    <span className="info-value">{request.responsable_nombre}</span>
                    <span className="info-detail">{request.responsable_email}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Fecha de Creación</span>
                    <span className="info-value">{formatDateTime(request.created_at)}</span>
                  </div>

                  {request.updated_at !== request.created_at && (
                    <div className="info-item">
                      <span className="info-label">Última Actualización</span>
                      <span className="info-value">{formatDateTime(request.updated_at)}</span>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Modal de Aprobar/Rechazar */}
        <Modal
          isOpen={showActionModal}
          onClose={handleCloseActionModal}
          title={modalAction === 'aprobado' ? '✅ Aprobar Solicitud' : 'Rechazar Solicitud'}
          size="medium"
        >
          <div className="modal-form">
            {error && (
              <div className="alert alert-error">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <label className="form-label">
              Comentario {modalAction === 'rechazado' && <span className="required">*</span>}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="form-textarea"
              rows="4"
              placeholder={
                modalAction === 'aprobado'
                  ? 'Agrega un comentario (opcional)'
                  : 'Explica el motivo del rechazo'
              }
            />

            <div className="modal-buttons">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCloseActionModal}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={`btn ${modalAction === 'aprobado' ? 'btn-success' : 'btn-danger'}`}
                onClick={handleSubmitAction}
                disabled={submitting}
              >
                {submitting ? 'Procesando...' : (modalAction === 'aprobado' ? 'Aprobar' : 'Rechazar')}
              </button>
            </div>
          </div>
        </Modal>

        {/* Modal de Edición */}
        <Modal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          title="Editar Solicitud"
          size="large"
        >
          <form onSubmit={handleSubmitEdit} className="modal-form">
            {error && (
              <div className="alert alert-error">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                Título <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={editData.titulo}
                onChange={(e) => handleEditChange('titulo', e.target.value)}
                maxLength={255}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Tipo de Solicitud <span className="required">*</span>
              </label>
              <select
                className="form-select"
                value={editData.tipo_solicitud_id}
                onChange={(e) => handleEditChange('tipo_solicitud_id', e.target.value)}
                required
              >
                <option value="">Selecciona un tipo</option>
                {requestTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Responsable <span className="required">*</span>
              </label>
              <select
                className="form-select"
                value={editData.responsable_id}
                onChange={(e) => handleEditChange('responsable_id', e.target.value)}
                required
              >
                <option value="">Selecciona un responsable</option>
                {approvers.map(approver => (
                  <option key={approver.id} value={approver.id}>
                    {approver.nombre} ({approver.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Descripción <span className="required">*</span>
              </label>
              <textarea
                className="form-textarea"
                value={editData.descripcion}
                onChange={(e) => handleEditChange('descripcion', e.target.value)}
                rows="6"
                required
              />
            </div>

            <div className="modal-buttons">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCloseEditModal}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </>
  );
};

export default RequestDetail;
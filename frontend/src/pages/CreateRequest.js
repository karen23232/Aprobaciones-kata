import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import requestService from '../services/requestService';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/CreateRequest.css';

const CreateRequest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo_solicitud_id: '',
    responsable_id: '',
  });

  const [file, setFile] = useState(null);
  const [types, setTypes] = useState([]);
  const [approvers, setApprovers] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [typesData, approversData] = await Promise.all([
        requestService.getTypes(),
        requestService.getApprovers(),
      ]);

      setTypes(typesData.data);
      setApprovers(approversData.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setApiError('Error al cargar los datos necesarios');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    if (apiError) {
      setApiError('');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      // Validar tipo de archivo
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!validTypes.includes(selectedFile.type)) {
        setErrors(prev => ({
          ...prev,
          file: 'Solo se permiten archivos PDF o Word (.doc, .docx)'
        }));
        setFile(null);
        e.target.value = '';
        return;
      }

      // Validar tamaño (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (selectedFile.size > maxSize) {
        setErrors(prev => ({
          ...prev,
          file: 'El archivo no debe superar los 5MB'
        }));
        setFile(null);
        e.target.value = '';
        return;
      }

      setFile(selectedFile);
      setErrors(prev => ({
        ...prev,
        file: ''
      }));
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    const fileInput = document.getElementById('file');
    if (fileInput) {
      fileInput.value = '';
    }
    setErrors(prev => ({
      ...prev,
      file: ''
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es requerido';
    } else if (formData.titulo.length < 5) {
      newErrors.titulo = 'El título debe tener al menos 5 caracteres';
    } else if (formData.titulo.length > 255) {
      newErrors.titulo = 'El título no puede exceder 255 caracteres';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    } else if (formData.descripcion.length < 10) {
      newErrors.descripcion = 'La descripción debe tener al menos 10 caracteres';
    }

    if (!formData.tipo_solicitud_id) {
      newErrors.tipo_solicitud_id = 'Debes seleccionar un tipo de solicitud';
    }

    if (!formData.responsable_id) {
      newErrors.responsable_id = 'Debes seleccionar un responsable';
    }

    // Validar que no se seleccione a sí mismo
    if (formData.responsable_id === user?.id?.toString()) {
      newErrors.responsable_id = 'No puedes asignarte a ti mismo como responsable';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await requestService.create({
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim(),
        tipo_solicitud_id: parseInt(formData.tipo_solicitud_id),
        responsable_id: parseInt(formData.responsable_id),
      });

      // TODO: Si necesitas subir el archivo al backend, aquí sería el lugar
      // Por ahora solo lo guardamos en el estado pero no lo enviamos
      if (file) {
        console.log('Archivo adjunto:', file.name);
        // Aquí podrías hacer una llamada adicional para subir el archivo
      }

      // Redirigir al detalle de la solicitud creada
      navigate(`/requests/${response.data.id}`, {
        state: { message: 'Solicitud creada exitosamente' }
      });
    } catch (error) {
      console.error('Error al crear solicitud:', error);

      if (error.errors && Array.isArray(error.errors)) {
        const newErrors = {};
        error.errors.forEach(err => {
          newErrors[err.field] = err.message;
        });
        setErrors(newErrors);
      } else {
        setApiError(error.message || 'Error al crear solicitud. Por favor intenta de nuevo.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="create-request-page">
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
        <div className="page-content">
          <LoadingSpinner fullScreen />
        </div>
      </div>
    );
  }

  return (
    <div className="create-request-page">
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
          
          <h1>Nueva Solicitud</h1>
        </div>
      </div>

      <div className="page-content">
        <div className="form-container">
          <Card>
            <div className="form-header">
              <h2>Crear Solicitud de Aprobación</h2>
              <p>Completa el formulario para crear una nueva solicitud</p>
            </div>

            {apiError && (
              <div className="alert alert-error">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="create-form" noValidate>
              <div className="form-group">
                <label htmlFor="titulo" className="form-label">
                  Título de la Solicitud <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  className={`form-input ${errors.titulo ? 'error' : ''}`}
                  placeholder="Ej: Aprobación para despliegue v2.0"
                  maxLength="255"
                />
                {errors.titulo && <span className="error-message">{errors.titulo}</span>}
                <span className="input-hint">{formData.titulo.length}/255 caracteres</span>
              </div>

              <div className="form-group">
                <label htmlFor="tipo_solicitud_id" className="form-label">
                  Tipo de Solicitud <span className="required">*</span>
                </label>
                <select
                  id="tipo_solicitud_id"
                  name="tipo_solicitud_id"
                  value={formData.tipo_solicitud_id}
                  onChange={handleChange}
                  className={`form-input ${errors.tipo_solicitud_id ? 'error' : ''}`}
                >
                  <option value="">Selecciona un tipo</option>
                  {types.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.nombre}
                    </option>
                  ))}
                </select>
                {errors.tipo_solicitud_id && <span className="error-message">{errors.tipo_solicitud_id}</span>}
                {formData.tipo_solicitud_id && (
                  <div className="type-description">
                    {types.find(t => t.id === parseInt(formData.tipo_solicitud_id))?.descripcion}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="responsable_id" className="form-label">
                  Responsable (Aprobador) <span className="required">*</span>
                </label>
                <select
                  id="responsable_id"
                  name="responsable_id"
                  value={formData.responsable_id}
                  onChange={handleChange}
                  className={`form-input ${errors.responsable_id ? 'error' : ''}`}
                >
                  <option value="">Selecciona un responsable</option>
                  {approvers
                    .filter(approver => approver.id !== user?.id)
                    .map(approver => (
                      <option key={approver.id} value={approver.id}>
                        {approver.nombre} ({approver.email}) - {approver.rol}
                      </option>
                    ))}
                </select>
                {errors.responsable_id && <span className="error-message">{errors.responsable_id}</span>}
                <span className="input-hint">Selecciona quién debe aprobar esta solicitud</span>
              </div>

              <div className="form-group">
                <label htmlFor="descripcion" className="form-label">
                  Descripción Detallada <span className="required">*</span>
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  className={`form-textarea ${errors.descripcion ? 'error' : ''}`}
                  placeholder="Describe detalladamente tu solicitud. Incluye toda la información relevante que el aprobador necesite conocer..."
                  rows="6"
                />
                {errors.descripcion && <span className="error-message">{errors.descripcion}</span>}
                <span className="input-hint">{formData.descripcion.length} caracteres</span>
              </div>



              <div className="form-info">
                <div className="info-icon">ℹ️</div>
                <div className="info-content">
                  <strong>Importante:</strong> Una vez creada la solicitud, el responsable recibirá una notificación y podrá aprobarla o rechazarla. Podrás ver el progreso en tu panel de solicitudes.
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/dashboard')}
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner size="small" />
                      <span>Creando solicitud...</span>
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      <span>Crear Solicitud</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </Card>

          {/* SIDEBAR DE CONSEJOS CON COLORES BANCO DE BOGOTÁ */}
          <Card className="info-sidebar">
            <h3>Consejos</h3>
            <ul className="tips-list">
              <li>
                <strong>Título claro:</strong> Usa un título descriptivo que resuma la solicitud.
              </li>
              <li>
                <strong>Detalles completos:</strong> Proporciona toda la información necesaria para la aprobación.
              </li>
              <li>
                <strong>Responsable correcto:</strong> Selecciona a la persona adecuada para aprobar.
              </li>
              <li>
                <strong>Seguimiento:</strong> Recibirás notificaciones sobre el estado de tu solicitud.
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateRequest;
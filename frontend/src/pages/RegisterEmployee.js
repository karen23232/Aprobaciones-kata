import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import employeeService from '../services/employeeservice';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/Registeremployee.css';

const RegisterEmployee = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    entryDate: '',
    position: '',
    department: '',
    technicalOnboardingDate: '',
    technicalOnboardingType: '',
    notes: ''
  });

  const technicalOnboardingTypes = [
    'Journey to Cloud',
    'DevOps Fundamentals',
    'Security Basics',
    'Architecture Principles',
    'Otro'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar errores cuando el usuario empiece a escribir
    if (error) setError(null);
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('El nombre completo es obligatorio');
      return false;
    }

    if (!formData.email.trim()) {
      setError('El correo electrónico es obligatorio');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor ingrese un correo electrónico válido');
      return false;
    }

    if (!formData.entryDate) {
      setError('La fecha de ingreso es obligatoria');
      return false;
    }

    // Validar que la fecha de onboarding técnico no sea anterior a la fecha de ingreso
    if (formData.technicalOnboardingDate && formData.entryDate) {
      if (new Date(formData.technicalOnboardingDate) < new Date(formData.entryDate)) {
        setError('La fecha del onboarding técnico no puede ser anterior a la fecha de ingreso');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Preparar datos - solo enviar campos con valores
      const dataToSend = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        entryDate: formData.entryDate,
        ...(formData.position && { position: formData.position.trim() }),
        ...(formData.department && { department: formData.department.trim() }),
        ...(formData.technicalOnboardingDate && { technicalOnboardingDate: formData.technicalOnboardingDate }),
        ...(formData.technicalOnboardingType && { technicalOnboardingType: formData.technicalOnboardingType }),
        ...(formData.notes && { notes: formData.notes.trim() })
      };

      await employeeService.createEmployee(dataToSend);
      
      setSuccess(true);
      
      // Esperar 2 segundos y redirigir al dashboard
      setTimeout(() => {
        navigate('/dashboard/employees');
      }, 2000);
      
    } catch (err) {
      console.error('Error al registrar colaborador:', err);
      setError(err.message || 'Error al registrar el colaborador. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return <LoadingSpinner message="Registrando colaborador..." />;
  }

  return (
    <div className="register-employee-container">
      <div className="register-header">
        <button onClick={handleCancel} className="back-button">
          ← Volver
        </button>
        <h1>Registrar Nuevo Colaborador</h1>
        <p className="subtitle">Complete el formulario para registrar un nuevo colaborador en el sistema</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span className="alert-icon">✅</span>
          <span>¡Colaborador registrado exitosamente! Redirigiendo...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="register-form">
        {/* Información Básica */}
        <div className="form-section">
          <h2 className="section-title">📋 Información Básica</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fullName" className="required">
                Nombre Completo
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Ej: Juan Pérez García"
                maxLength={255}
                required
              />
              <small>{formData.fullName.length}/255 caracteres</small>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="required">
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="juan.perez@bancobogota.com"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="entryDate" className="required">
                Fecha de Ingreso
              </label>
              <input
                type="date"
                id="entryDate"
                name="entryDate"
                value={formData.entryDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="position">
                Cargo
              </label>
              <input
                type="text"
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="Ej: Desarrollador Full Stack"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="department">
              Departamento
            </label>
            <input
              type="text"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Ej: Tecnología e Innovación"
            />
          </div>
        </div>

        {/* Onboarding Técnico */}
        <div className="form-section">
          <h2 className="section-title">🎯 Onboarding Técnico</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="technicalOnboardingType">
                Tipo de Onboarding Técnico
              </label>
              <select
                id="technicalOnboardingType"
                name="technicalOnboardingType"
                value={formData.technicalOnboardingType}
                onChange={handleChange}
              >
                <option value="">Seleccione un tipo</option>
                {technicalOnboardingTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="technicalOnboardingDate">
                Fecha Programada (Opcional)
              </label>
              <input
                type="date"
                id="technicalOnboardingDate"
                name="technicalOnboardingDate"
                value={formData.technicalOnboardingDate}
                onChange={handleChange}
                min={formData.entryDate}
              />
              <small>La fecha debe ser posterior a la fecha de ingreso</small>
            </div>
          </div>
        </div>

        {/* Notas Adicionales */}
        <div className="form-section">
          <h2 className="section-title">📝 Notas Adicionales</h2>
          
          <div className="form-group">
            <label htmlFor="notes">
              Observaciones
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Información adicional relevante sobre el colaborador o su proceso de onboarding..."
              rows={4}
              maxLength={1000}
            />
            <small>{formData.notes.length}/1000 caracteres</small>
          </div>
        </div>

        {/* Consejos */}
        <div className="tips-section">
          <h3>💡 Consejos</h3>
          <ul>
            <li>✓ <strong>Título claro:</strong> Use un nombre completo descriptivo</li>
            <li>✓ <strong>Detalles completos:</strong> Proporcione toda la información necesaria</li>
            <li>✓ <strong>Fecha correcta:</strong> Verifique que las fechas sean coherentes</li>
            <li>✓ <strong>Seguimiento:</strong> Recibirá notificaciones sobre el estado del onboarding</li>
          </ul>
        </div>

        {/* Botones */}
        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="btn-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrar Colaborador'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterEmployee;
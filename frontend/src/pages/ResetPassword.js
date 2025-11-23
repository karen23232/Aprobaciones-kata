import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import PasswordInput from '../components/PasswordInput';
import LoadingSpinner from '../components/LoadingSpinner';
import { validatePassword } from '../utils/validation';
import '../styles/Auth.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    token: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [showRequirements, setShowRequirements] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validación en tiempo real para la contraseña
    if (name === 'newPassword') {
      const validation = validatePassword(value);
      setPasswordErrors(validation.errors);
      setShowRequirements(value.length > 0);
    }
    
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.token) {
      newErrors.token = 'El token es requerido';
    } else if (formData.token.length < 10) {
      newErrors.token = 'El token debe tener al menos 10 caracteres';
    }

    const passwordValidation = validatePassword(formData.newPassword);
    if (!formData.newPassword) {
      newErrors.newPassword = 'La contraseña es requerida';
    } else if (!passwordValidation.isValid) {
      newErrors.newPassword = 'La contraseña no cumple los requisitos de seguridad';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
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

    setLoading(true);

    try {
      await authService.resetPassword(formData.token, formData.newPassword);
      
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      let errorMessage = 'Error al restablecer la contraseña';
      
      if (error.message?.includes('token') || error.message?.includes('expirado')) {
        errorMessage = '❌ Token inválido o expirado. Solicita uno nuevo.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setApiError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container-split">
        <div className="auth-left-panel">
          <div className="auth-left-overlay"></div>
          <div className="auth-left-content">
            <div className="auth-brand">
              <img src="/assets/images/Logo.png" alt="Banco de Bogotá" className="auth-brand-logo" />
              <h1 className="auth-brand-title">Banco de Bogotá</h1>
            </div>
            
            <div className="auth-welcome">
              <h2 className="auth-welcome-title">¡Todo Listo!</h2>
              <p className="auth-welcome-subtitle">Tu contraseña ha sido actualizada</p>
              <div className="auth-welcome-divider"></div>
              <p className="auth-welcome-description">
                Ya puedes iniciar sesión con tu nueva contraseña
              </p>
            </div>
          </div>
          
          <div className="auth-left-image">
            <img src="/assets/images/Imagen 2.jpg" alt="Banco de Bogotá" />
          </div>
        </div>

        <div className="auth-right-panel">
          <div className="auth-card-new success-card">
            <div className="success-icon">
              <svg width="80" height="80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h1 className="auth-title-new">¡Contraseña Actualizada!</h1>
            <p className="auth-subtitle-new">
              Tu contraseña ha sido restablecida exitosamente
            </p>

            <div className="success-spinner">
              <LoadingSpinner />
              <p>Redirigiendo al inicio de sesión...</p>
            </div>

            <Link to="/login" className="btn-new btn-primary-new btn-full-new">
              Ir a Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container-split">
      {/* Panel Izquierdo */}
      <div className="auth-left-panel">
        <div className="auth-left-overlay"></div>
        <div className="auth-left-content">
          <div className="auth-brand">
            <img src="/assets/images/Logo.png" alt="Banco de Bogotá" className="auth-brand-logo" />
            <h1 className="auth-brand-title">Banco de Bogotá</h1>
          </div>
          
          <div className="auth-welcome">
            <h2 className="auth-welcome-title">Nueva Contraseña</h2>
            <p className="auth-welcome-subtitle">Sistema de Servicios y Aprobaciones</p>
            <div className="auth-welcome-divider"></div>
            <p className="auth-welcome-description">
              Crea una contraseña segura para proteger tu cuenta
            </p>
          </div>

          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span>Contraseña segura</span>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span>Validación en tiempo real</span>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span>Proceso rápido</span>
            </div>
          </div>
        </div>
        
        <div className="auth-left-image">
          <img src="/assets/images/Imagen 2.jpg" alt="Banco de Bogotá" />
        </div>
      </div>

      {/* Panel Derecho - Formulario */}
      <div className="auth-right-panel">
        <div className="auth-card-new">
          <div className="auth-card-header">
            <h1 className="auth-title-new">Restablecer Contraseña</h1>
            <p className="auth-subtitle-new">Ingresa tu token y crea una nueva contraseña</p>
          </div>

          {apiError && (
            <div className="alert alert-error">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form-new" noValidate>
            <div className="form-group-new">
              <label htmlFor="token" className="form-label-new">
                Token de Recuperación
              </label>
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <input
                  type="text"
                  id="token"
                  name="token"
                  value={formData.token}
                  onChange={handleChange}
                  className={`form-input-new ${errors.token ? 'error' : ''}`}
                  placeholder="Pega aquí tu token"
                  style={{ fontFamily: 'monospace' }}
                />
              </div>
              {errors.token && <span className="error-message">{errors.token}</span>}
              <small className="input-hint">
                Revisa tu email o la consola del servidor
              </small>
            </div>

            <div className="form-group-new">
              <label htmlFor="newPassword" className="form-label-new">
                Nueva Contraseña
              </label>
              <PasswordInput
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Crea una contraseña segura"
                name="newPassword"
                error={errors.newPassword}
                showStrength={true}
              />

              {showRequirements && (
                <div className="password-requirements">
                  <p className="requirements-title">Requisitos de seguridad:</p>
                  <ul className="requirements-list">
                    <li className={`requirement-item ${formData.newPassword.length >= 8 ? 'valid' : ''}`}>
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Mínimo 8 caracteres
                    </li>
                    <li className={`requirement-item ${/[A-Z]/.test(formData.newPassword) ? 'valid' : ''}`}>
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Al menos 1 mayúscula
                    </li>
                    <li className={`requirement-item ${/[a-z]/.test(formData.newPassword) ? 'valid' : ''}`}>
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Al menos 1 minúscula
                    </li>
                    <li className={`requirement-item ${/[0-9]/.test(formData.newPassword) ? 'valid' : ''}`}>
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Al menos 1 número
                    </li>
                    <li className={`requirement-item ${/[!@#$%^&*]/.test(formData.newPassword) ? 'valid' : ''}`}>
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Al menos 1 símbolo (!@#$%^&*)
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div className="form-group-new">
              <label htmlFor="confirmPassword" className="form-label-new">
                Confirmar Contraseña
              </label>
              <PasswordInput
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repite tu contraseña"
                name="confirmPassword"
                error={errors.confirmPassword}
              />
            </div>

            <button
              type="submit"
              className="btn-new btn-primary-new btn-full-new"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="small" />
                  <span>Actualizando...</span>
                </>
              ) : (
                'Restablecer Contraseña'
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>o</span>
          </div>

          <div className="auth-footer-new">
            <Link to="/forgot-password" className="auth-link-back">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Solicitar nuevo token
            </Link>
            <span className="divider-dot">•</span>
            <Link to="/login" className="auth-link-back">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
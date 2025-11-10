import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import PasswordInput from '../components/PasswordInput';
import LoadingSpinner from '../components/LoadingSpinner';
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar errores
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
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'La contraseña es requerida';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'La contraseña debe tener al menos 6 caracteres';
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
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      setApiError(error.message || 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div style={{ 
              fontSize: '48px', 
              textAlign: 'center',
              marginBottom: '16px'
            }}>
              ✅
            </div>
            <h1 className="auth-title">¡Contraseña Actualizada!</h1>
            <p className="auth-subtitle">
              Tu contraseña ha sido restablecida exitosamente. Redirigiendo al inicio de sesión...
            </p>
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <LoadingSpinner />
          </div>

          <div className="auth-footer">
            <Link to="/login" className="auth-link">
              Ir a Iniciar Sesión →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Restablecer Contraseña</h1>
          <p className="auth-subtitle">
            Ingresa tu token y tu nueva contraseña
          </p>
        </div>

        {apiError && (
          <div className="alert alert-error">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="token" className="form-label">
              Token de Recuperación
            </label>
            <input
              type="text"
              id="token"
              name="token"
              value={formData.token}
              onChange={handleChange}
              className={`form-input ${errors.token ? 'error' : ''}`}
              placeholder="Pega aquí tu token"
              style={{ fontFamily: 'monospace', fontSize: '14px' }}
            />
            {errors.token && (
              <span className="error-message">{errors.token}</span>
            )}
            <small style={{ 
              display: 'block', 
              marginTop: '8px', 
              color: '#6b7280',
              fontSize: '13px'
            }}>
              Revisa la consola del servidor o tu email
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="newPassword" className="form-label">
              Nueva Contraseña
            </label>
            <PasswordInput
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              name="newPassword"
              error={errors.newPassword}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
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
            className="btn btn-primary btn-full"
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

        <div className="auth-footer">
          <Link to="/login" className="auth-link">
            ← Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PasswordInput from '../components/PasswordInput';
import LoadingSpinner from '../components/LoadingSpinner';
import { validateEmail } from '../utils/validation';
import '../styles/Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar errores al escribir
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

    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
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
      await login({
        email: formData.email,
        password: formData.password,
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error en login:', error);
      
      if (error.errors && Array.isArray(error.errors)) {
        const newErrors = {};
        error.errors.forEach(err => {
          newErrors[err.field] = err.message;
        });
        setErrors(newErrors);
      } else {
        let errorMessage = 'Error al iniciar sesión. Por favor intenta de nuevo.';
        
        if (error.message?.includes('Credenciales inválidas')) {
          errorMessage = '❌ Email o contraseña incorrectos. Verifica tus datos e intenta nuevamente.';
        } else if (error.message?.includes('no encontrado')) {
          errorMessage = '❌ No existe una cuenta con este email. ¿Deseas registrarte?';
        }
        
        setApiError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Iniciar Sesión</h1>
          <p className="auth-subtitle">Ingresa a tu cuenta para continuar</p>
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
            <label htmlFor="email" className="form-label">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="tu@email.com"
              autoComplete="email"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <PasswordInput
              value={formData.password}
              onChange={handleChange}
              placeholder="Ingresa tu contraseña"
              name="password"
              error={errors.password}
            />
            
            {/* Enlace de recuperación de contraseña */}
            <div className="forgot-password">
              <Link to="/forgot-password">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoadingSpinner size="small" />
                <span>Iniciando sesión...</span>
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            ¿No tienes una cuenta?{' '}
            <Link to="/register" className="auth-link">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
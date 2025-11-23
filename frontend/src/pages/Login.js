import React, { useState, useEffect } from 'react';
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
  const [errorTimer, setErrorTimer] = useState(null);

  // Limpiar timer al desmontar componente
  useEffect(() => {
    return () => {
      if (errorTimer) {
        clearTimeout(errorTimer);
      }
    };
  }, [errorTimer]);

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
    // NO limpiar apiError al escribir - solo después de 15 segundos
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Ingresa un email válido (ejemplo: usuario@correo.com)';
      } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Email inválido';
      }
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Limpiar timer anterior si existe
    if (errorTimer) {
      clearTimeout(errorTimer);
    }
    
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
        } else if (error.message?.includes('desactivada')) {
          errorMessage = '❌ Tu cuenta está desactivada. Contacta al administrador.';
        } else if (error.message) {
          errorMessage = `❌ ${error.message}`;
        }
        
        setApiError(errorMessage);
        
        // ⏰ El error permanecerá visible por 15 segundos
        const timer = setTimeout(() => {
          setApiError('');
        }, 15000); // 15 segundos
        
        setErrorTimer(timer);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container-split">
      {/* Panel Izquierdo - Imagen y Mensaje de Bienvenida */}
      <div className="auth-left-panel">
        <div className="auth-left-overlay"></div>
        <div className="auth-left-content">
          <div className="auth-brand">
            <img src="/assets/images/Logo.png" alt="Banco de Bogotá" className="auth-brand-logo" />
            <h1 className="auth-brand-title">Banco de Bogotá</h1>
          </div>
          
          <div className="auth-welcome">
            <h2 className="auth-welcome-title">Bienvenido</h2>
            <p className="auth-welcome-subtitle">Sistema de Servicios y Aprobaciones</p>
            <div className="auth-welcome-divider"></div>
            <p className="auth-welcome-description">
              Gestiona tus solicitudes de manera eficiente y segura
            </p>
          </div>

          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span>Aprobaciones en tiempo real</span>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span>Seguridad garantizada</span>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span>Reportes detallados</span>
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
            <h1 className="auth-title-new">Iniciar Sesión</h1>
            <p className="auth-subtitle-new">Ingresa a tu cuenta para continuar</p>
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
              <label htmlFor="email" className="form-label-new">
                Correo Electrónico
              </label>
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input-new ${errors.email ? 'error' : ''}`}
                  placeholder="tu@email.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group-new">
              <label htmlFor="password" className="form-label-new">
                Contraseña
              </label>
              <PasswordInput
                value={formData.password}
                onChange={handleChange}
                placeholder="Ingresa tu contraseña"
                name="password"
                error={errors.password}
              />
              
              <div className="forgot-password">
                <Link to="/forgot-password">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              className="btn-new btn-primary-new btn-full-new"
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

          <div className="auth-divider">
            <span>o</span>
          </div>

          <div className="auth-footer-new">
            <p>
              ¿No tienes una cuenta?{' '}
              <Link to="/register" className="auth-link-new">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
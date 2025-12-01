import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PasswordInput from '../components/PasswordInput';
import LoadingSpinner from '../components/LoadingSpinner';
import { validateEmail, validatePassword, validateName } from '../utils/validation';
import '../styles/Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: 'solicitante',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [passwordErrors, setPasswordErrors] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'password') {
      const validation = validatePassword(value);
      setPasswordErrors(validation.errors);
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    if (apiError) setApiError('');
  };

  const validateForm = () => {
    const newErrors = {};

    const nameValidation = validateName(formData.nombre);
    if (!nameValidation.isValid) newErrors.nombre = nameValidation.error;

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

    const passwordValidation = validatePassword(formData.password);
    if (!formData.password) newErrors.password = 'La contraseña es requerida';
    else if (!passwordValidation.isValid)
      newErrors.password = 'La contraseña no cumple los requisitos';

    if (!formData.confirmPassword)
      newErrors.confirmPassword = 'Confirma tu contraseña';
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Las contraseñas no coinciden';

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
      await register({
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        rol: formData.rol,
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error en registro:', error);
      
      if (error.errors && Array.isArray(error.errors)) {
        const newErrors = {};
        error.errors.forEach(err => {
          newErrors[err.field] = err.message;
        });
        setErrors(newErrors);
      } else {
        let errorMessage = 'Error al registrar usuario. Por favor intenta de nuevo.';
        
        if (error.message?.includes('ya está registrado') || error.message?.includes('ya existe')) {
          errorMessage = '❌ Este email ya está registrado. Intenta con otro correo o inicia sesión.';
        } else if (error.message?.includes('email')) {
          errorMessage = '❌ Email inválido o ya en uso.';
        }
        
        setApiError(errorMessage);
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
            <h2 className="auth-welcome-title">Únete al equipo</h2>
            <p className="auth-welcome-subtitle">Sistema de Onboarding de Colaboradores</p>
            <div className="auth-welcome-divider"></div>
            <p className="auth-welcome-description">
              Crea tu cuenta y gestiona el onboarding de colaboradores de manera profesional
            </p>
          </div>

          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span>Registro rápido y sencillo</span>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span>Control de onboardings</span>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span>Alertas por email</span>
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
            <h1 className="auth-title-new">Crear Cuenta</h1>
            <p className="auth-subtitle-new">Completa el formulario para registrarte</p>
          </div>

          {apiError && (
            <div className="alert alert-error">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form-new" noValidate>
            <div className="form-group-new">
              <label htmlFor="nombre" className="form-label-new">
                Nombre Completo
              </label>
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={`form-input-new ${errors.nombre ? 'error' : ''}`}
                  placeholder="Juan Pérez"
                  autoComplete="name"
                />
              </div>
              {errors.nombre && <span className="error-message">{errors.nombre}</span>}
            </div>

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
              <label htmlFor="rol" className="form-label-new">
                Rol
              </label>
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <select
                  id="rol"
                  name="rol"
                  value={formData.rol}
                  onChange={handleChange}
                  className="form-input-new form-select-new"
                >
                  <option value="solicitante">Solicitante</option>
                  <option value="aprobador">Aprobador</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>

            <div className="form-group-new">
              <label htmlFor="password" className="form-label-new">
                Contraseña
              </label>
              <PasswordInput
                value={formData.password}
                onChange={handleChange}
                placeholder="Crea una contraseña segura"
                name="password"
                error={errors.password}
                showStrength={true}
              />

              {passwordErrors.length > 0 && formData.password && (
                <div className="password-requirements">
                  <p className="requirements-title">La contraseña debe contener:</p>
                  <ul className="requirements-list">
                    {passwordErrors.map((error, index) => (
                      <li key={index} className="requirement-item">
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {error}
                      </li>
                    ))}
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
                placeholder="Confirma tu contraseña"
                name="confirmPassword"
                error={errors.confirmPassword}
              />
            </div>

            <button type="submit" className="btn-new btn-primary-new btn-full-new" disabled={loading}>
              {loading ? (
                <>
                  <LoadingSpinner size="small" />
                  <span>Creando cuenta...</span>
                </>
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>o</span>
          </div>

          <div className="auth-footer-new">
            <p>
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="auth-link-new">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
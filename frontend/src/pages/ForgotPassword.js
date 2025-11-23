import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import LoadingSpinner from '../components/LoadingSpinner';
import { validateEmail } from '../utils/validation';
import '../styles/Auth.css';

const ForgotPassword = () => {
  const [method, setMethod] = useState('email'); // 'email' o 'token'
  const [emailForEmail, setEmailForEmail] = useState('');
  const [emailForToken, setEmailForToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [devToken, setDevToken] = useState('');
  const [copied, setCopied] = useState(false);

  const handleMethodChange = (newMethod) => {
    setMethod(newMethod);
    setError('');
    setSuccess(false);
    setDevToken('');
    setCopied(false);
  };

  const validateEmailInput = (email) => {
    if (!email) {
      return 'El email es requerido';
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return 'Ingresa un email válido (ejemplo: usuario@correo.com)';
    }

    if (!validateEmail(email)) {
      return 'Email inválido';
    }

    return null;
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setDevToken('');
    setCopied(false);

    const validationError = validateEmailInput(emailForEmail);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await authService.forgotPassword(emailForEmail);
      setSuccess(true);
      
      if (response.devToken) {
        setDevToken(response.devToken);
      }
    } catch (err) {
      setError(err.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleTokenSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setDevToken('');
    setCopied(false);

    const validationError = validateEmailInput(emailForToken);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await authService.forgotPassword(emailForToken);
      setSuccess(true);
      
      if (response.devToken) {
        setDevToken(response.devToken);
      }
    } catch (err) {
      setError(err.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(devToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="auth-container-split">
      {/* Panel Izquierdo - Imagen y Mensaje */}
      <div className="auth-left-panel">
        <div className="auth-left-overlay"></div>
        <div className="auth-left-content">
          <div className="auth-brand">
            <img src="/assets/images/Logo.png" alt="Banco de Bogotá" className="auth-brand-logo" />
            <h1 className="auth-brand-title">Banco de Bogotá</h1>
          </div>
          
          <div className="auth-welcome">
            <h2 className="auth-welcome-title">Recupera tu Cuenta</h2>
            <p className="auth-welcome-subtitle">Sistema de Servicios y Aprobaciones</p>
            <div className="auth-welcome-divider"></div>
            <p className="auth-welcome-description">
              Elige el método más conveniente para recuperar tu contraseña de forma segura
            </p>
          </div>

          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span>Recuperación por email</span>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <span>Acceso directo por token</span>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span>Proceso 100% seguro</span>
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
            <h1 className="auth-title-new">Recuperar Contraseña</h1>
            <p className="auth-subtitle-new">Elige tu método preferido de recuperación</p>
          </div>

          {/* Tabs para seleccionar método */}
          <div className="method-tabs">
            <button
              className={`method-tab ${method === 'email' ? 'active' : ''}`}
              onClick={() => handleMethodChange('email')}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Por Email
            </button>
            <button
              className={`method-tab ${method === 'token' ? 'active' : ''}`}
              onClick={() => handleMethodChange('token')}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Con Token
            </button>
          </div>

          {error && (
            <div className="alert alert-error">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <strong>✅ Solicitud procesada</strong>
                <p className="alert-text">
                  Si el email existe, recibirás las instrucciones de recuperación.
                </p>
              </div>
            </div>
          )}

          {/* Token de desarrollo */}
          {devToken && (
            <div className="dev-token-box">
              <div className="dev-token-header">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Token de Desarrollo</span>
              </div>
              <div className="dev-token-content">
                <code>{devToken}</code>
              </div>
              <button onClick={copyToClipboard} className={`btn-copy ${copied ? 'copied' : ''}`}>
                {copied ? (
                  <>
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    ¡Copiado!
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                    Copiar
                  </>
                )}
              </button>
            </div>
          )}

          {/* Método Email */}
          {method === 'email' && (
            <form onSubmit={handleEmailSubmit} className="auth-form-new" noValidate>
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
                    value={emailForEmail}
                    onChange={(e) => setEmailForEmail(e.target.value)}
                    className="form-input-new"
                    placeholder="tu@email.com"
                    autoComplete="email"
                    disabled={loading || success}
                  />
                </div>
                <small className="input-hint">
                  Te enviaremos instrucciones de recuperación a este correo
                </small>
              </div>

              <button
                type="submit"
                className="btn-new btn-primary-new btn-full-new"
                disabled={loading || success}
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="small" />
                    <span>Enviando...</span>
                  </>
                ) : success ? (
                  '✓ Solicitud Enviada'
                ) : (
                  'Enviar Instrucciones'
                )}
              </button>
            </form>
          )}

          {/* Método Token */}
          {method === 'token' && (
            <form onSubmit={handleTokenSubmit} className="auth-form-new" noValidate>
              <div className="info-box">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="info-title">Genera tu token</p>
                  <p className="info-text">
                    Ingresa tu email registrado para generar un token de recuperación que podrás usar inmediatamente.
                  </p>
                </div>
              </div>

              <div className="form-group-new">
                <label htmlFor="emailToken" className="form-label-new">
                  Correo Electrónico Registrado
                </label>
                <div className="input-wrapper">
                  <svg className="input-icon" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="email"
                    id="emailToken"
                    name="emailToken"
                    value={emailForToken}
                    onChange={(e) => setEmailForToken(e.target.value)}
                    className="form-input-new"
                    placeholder="tu@email.com"
                    autoComplete="email"
                    disabled={loading || success}
                  />
                </div>
                <small className="input-hint">
                  Verifica que este email esté registrado en tu cuenta
                </small>
              </div>

              <button
                type="submit"
                className="btn-new btn-primary-new btn-full-new"
                disabled={loading || success}
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="small" />
                    <span>Generando token...</span>
                  </>
                ) : success ? (
                  '✓ Token Generado'
                ) : (
                  <>
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    Generar Token
                  </>
                )}
              </button>
            </form>
          )}

          {success && (
            <div className="quick-access">
              <Link to="/reset-password" className="quick-access-link">
                {devToken ? 'Usar este token ahora →' : '¿Ya tienes tu token? Úsalo aquí →'}
              </Link>
            </div>
          )}

          <div className="auth-divider">
            <span>o</span>
          </div>

          <div className="auth-footer-new">
            <Link to="/login" className="auth-link-back">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
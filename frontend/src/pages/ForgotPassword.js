import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import LoadingSpinner from '../components/LoadingSpinner';
import { validateEmail } from '../utils/validation';
import '../styles/Token.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [devToken, setDevToken] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setDevToken('');
    setCopied(false);

    if (!email) {
      setError('El email es requerido');
      return;
    }

    if (!validateEmail(email)) {
      setError('Email inválido');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);
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
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">¿Olvidaste tu contraseña?</h1>
          <p className="auth-subtitle">
            Ingresa tu email y te enviaremos instrucciones para recuperar tu contraseña
          </p>
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
              <p className="alert-success-text">
                Si el email existe en nuestro sistema, recibirás las instrucciones.
              </p>
            </div>
          </div>
        )}

        {/* TOKEN CON DISEÑO LIMPIO */}
        {devToken && (
          <div className="token-container">
            {/* Header */}
            <div className="token-header">
              <span className="token-icon">🔧</span>
              <span className="token-title">Modo Desarrollo</span>
            </div>

            {/* Descripción */}
            <p className="token-description">
              Tu token de recuperación:
            </p>

            {/* CAJA DEL TOKEN */}
            <div className="token-box">
              <code className="token-code">
                {devToken}
              </code>
            </div>

            {/* BOTÓN COPIAR */}
            <button
              onClick={copyToClipboard}
              className={`btn-copy-token ${copied ? 'copied' : ''}`}
            >
              {copied ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  ¡Copiado!
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                  Copiar Token
                </>
              )}
            </button>

            {/* Texto de ayuda */}
            <p className="token-hint">
              Usa este token en la página de restablecimiento de contraseña
            </p>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="tu@email.com"
              autoComplete="email"
              disabled={loading || success}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading || success}
          >
            {loading ? (
              <>
                <LoadingSpinner size="small" />
                <span>Procesando...</span>
              </>
            ) : success ? (
              'Solicitud Enviada'
            ) : (
              'Recuperar Contraseña'
            )}
          </button>
        </form>

        {success && (
          <div className="token-link-container">
            <Link to="/reset-password" className="token-link">
              Ya tengo mi token →
            </Link>
          </div>
        )}

        <div className="auth-footer">
          <Link to="/login" className="auth-footer-link">
            ← Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
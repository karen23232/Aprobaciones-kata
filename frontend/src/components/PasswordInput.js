import React, { useState } from 'react';
import '../styles/PasswordInput.css';

const PasswordInput = ({ 
  value, 
  onChange, 
  placeholder = 'Contraseña',
  name = 'password',
  error,
  showStrength = false
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;

    const strengthMap = {
      0: { text: 'Muy débil', class: 'very-weak' },
      1: { text: 'Muy débil', class: 'very-weak' },
      2: { text: 'Débil', class: 'weak' },
      3: { text: 'Media', class: 'medium' },
      4: { text: 'Fuerte', class: 'strong' },
      5: { text: 'Muy fuerte', class: 'very-strong' },
    };

    return { strength, ...strengthMap[strength] };
  };

  const passwordStrength = showStrength ? getPasswordStrength(value) : null;

  return (
    <div className="password-input-container">
      <div className={`password-input-wrapper ${error ? 'error' : ''}`}>
        <input
          type={showPassword ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="password-input"
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="toggle-password-btn"
          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {showPassword ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          )}
        </button>
      </div>
      
      {showStrength && value && (
        <div className="password-strength">
          <div className="strength-bars">
            {[1, 2, 3, 4, 5].map((bar) => (
              <div
                key={bar}
                className={`strength-bar ${
                  bar <= passwordStrength.strength ? passwordStrength.class : ''
                }`}
              />
            ))}
          </div>
          <span className={`strength-text ${passwordStrength.class}`}>
            {passwordStrength.text}
          </span>
        </div>
      )}
      
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default PasswordInput;
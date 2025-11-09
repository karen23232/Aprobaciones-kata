export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Mínimo 8 caracteres');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Una letra minúscula');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Una letra mayúscula');
  }
  if (!/\d/.test(password)) {
    errors.push('Un número');
  }
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Un carácter especial (@$!%*?&)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateName = (name) => {
  if (!name || name.trim().length < 2) {
    return { isValid: false, error: 'El nombre debe tener al menos 2 caracteres' };
  }
  if (name.length > 100) {
    return { isValid: false, error: 'El nombre no puede exceder 100 caracteres' };
  }
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)) {
    return { isValid: false, error: 'El nombre solo puede contener letras' };
  }
  return { isValid: true };
};
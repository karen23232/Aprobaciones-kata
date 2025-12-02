import React from 'react';
import '../styles/Badge.css';

/**
 * Componente Badge para mostrar estados
 * @param {string} status - Estado ('completed', 'pending', 'warning', 'info')
 * @param {string} text - Texto a mostrar
 * @param {string} icon - Icono opcional
 */
const StatusBadge = ({ status, text, icon }) => {
  const getStatusClass = () => {
    switch (status) {
      case 'completed':
      case 'success':
        return 'badge-success';
      case 'pending':
        return 'badge-pending';
      case 'warning':
        return 'badge-warning';
      case 'info':
        return 'badge-info';
      case 'danger':
      case 'error':
        return 'badge-danger';
      default:
        return 'badge-default';
    }
  };

  return (
    <span className={`status-badge ${getStatusClass()}`}>
      {icon && <span className="badge-icon">{icon}</span>}
      <span className="badge-text">{text}</span>
    </span>
  );
};

export default StatusBadge;
import React from 'react';
import '../styles/Badge.css';

const Badge = ({ children, variant = 'default', size = 'medium' }) => {
  return (
    <span className={`badge badge-${variant} badge-${size}`}>
      {children}
    </span>
  );
};

export default Badge;
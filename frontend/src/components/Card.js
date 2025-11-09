import React from 'react';
import '../styles/Card.css';

const Card = ({ children, className = '', hover = false, onClick }) => {
  return (
    <div 
      className={`card ${hover ? 'card-hover' : ''} ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {children}
    </div>
  );
};

export default Card;
import React from 'react';
import '../styles/LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        <div className={`spinner spinner-${size}`}></div>
      </div>
    );
  }

  return <div className={`spinner spinner-${size}`}></div>;
};

export default LoadingSpinner;
import React from 'react';
import '../styles/StatsCard.css';

const StatsCard = ({ title, value, icon, color = 'primary', trend }) => {
  return (
    <div className={`stats-card stats-card-${color}`}>
      <div className="stats-card-content">
        <div className="stats-card-header">
          <span className="stats-card-title">{title}</span>
          {icon && <span className="stats-card-icon">{icon}</span>}
        </div>
        <div className="stats-card-value">{value}</div>
        {trend && (
          <div className={`stats-card-trend ${trend.direction}`}>
            {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
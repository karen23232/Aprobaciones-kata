import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import employeeService from '../services/employeeservice';
import StatusBadge from '../components/Statusbadge';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/OnboardingCalendar.css';

const OnboardingCalendar = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [calendarData, setCalendarData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('year'); // 'year' o 'month'

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  useEffect(() => {
    loadCalendar();
  }, [selectedYear, selectedMonth]);

  const loadCalendar = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = { year: selectedYear };
      if (viewMode === 'month' && selectedMonth !== null) {
        params.month = (selectedMonth + 1).toString();
      }

      const response = await employeeService.getTechnicalOnboardingCalendar(params);
      setCalendarData(response.data);
    } catch (err) {
      console.error('Error al cargar calendario:', err);
      setError('Error al cargar el calendario');
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (increment) => {
    setSelectedYear(prev => prev + increment);
  };

  const handleMonthSelect = (monthIndex) => {
    setSelectedMonth(monthIndex);
    setViewMode('month');
  };

  const handleBackToYear = () => {
    setViewMode('year');
    setSelectedMonth(null);
  };

  const getMonthData = (monthIndex) => {
    const monthStart = new Date(selectedYear, monthIndex, 1);
    const monthEnd = new Date(selectedYear, monthIndex + 1, 0);
    
    const eventsInMonth = Object.entries(calendarData).filter(([date]) => {
      const eventDate = new Date(date);
      return eventDate >= monthStart && eventDate <= monthEnd;
    });

    return eventsInMonth.length;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysInWeek = (date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - 3); // 3 días antes
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day.toISOString().split('T')[0]);
    }
    return days;
  };

  const getWeekLabel = (dateString) => {
    const date = new Date(dateString);
    const start = new Date(date);
    start.setDate(start.getDate() - 3);
    const end = new Date(date);
    end.setDate(end.getDate() + 3);
    
    return `${start.getDate()} - ${end.getDate()} ${months[date.getMonth()]}`;
  };

  if (loading) {
    return <LoadingSpinner message="Cargando calendario..." />;
  }

  const totalEvents = Object.keys(calendarData).length;

  return (
    <div className="calendar-container">
      {/* Header */}
      <div className="calendar-header">
        <div>
          <h1>📅 Calendario de Onboardings Técnicos</h1>
          <p className="subtitle">
            Visualiza las sesiones programadas de onboarding técnico
          </p>
        </div>
        <div className="calendar-stats">
          <div className="stat-item">
            <span className="stat-number">{totalEvents}</span>
            <span className="stat-label">Sesiones Programadas</span>
          </div>
        </div>
      </div>

      {/* Year Selector */}
      <div className="year-selector">
        <button onClick={() => handleYearChange(-1)} className="year-btn">
          ← {selectedYear - 1}
        </button>
        <h2 className="current-year">{selectedYear}</h2>
        <button onClick={() => handleYearChange(1)} className="year-btn">
          {selectedYear + 1} →
        </button>
      </div>

      {/* View Toggle */}
      {viewMode === 'month' && (
        <div className="view-controls">
          <button onClick={handleBackToYear} className="back-to-year-btn">
            ← Volver a vista anual
          </button>
          <h3 className="selected-month-title">
            {months[selectedMonth]} {selectedYear}
          </h3>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Year View - Months Grid */}
      {viewMode === 'year' && (
        <div className="months-grid">
          {months.map((month, index) => {
            const eventsCount = getMonthData(index);
            return (
              <div
                key={month}
                className={`month-card ${eventsCount > 0 ? 'has-events' : ''}`}
                onClick={() => eventsCount > 0 && handleMonthSelect(index)}
                style={{ cursor: eventsCount > 0 ? 'pointer' : 'default' }}
              >
                <div className="month-header">
                  <h3>{month}</h3>
                  {eventsCount > 0 && (
                    <span className="events-badge">{eventsCount}</span>
                  )}
                </div>
                <div className="month-preview">
                  {eventsCount > 0 ? (
                    <p className="has-events-text">
                      👥 {eventsCount} sesión{eventsCount !== 1 ? 'es' : ''}
                    </p>
                  ) : (
                    <p className="no-events-text">Sin sesiones</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Month View - Detailed Events */}
      {viewMode === 'month' && (
        <div className="month-detail-view">
          {Object.keys(calendarData).length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3>No hay sesiones programadas</h3>
              <p>No se encontraron onboardings técnicos para este período</p>
            </div>
          ) : (
            <div className="events-timeline">
              {Object.entries(calendarData)
                .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
                .filter(([date]) => {
                  if (selectedMonth === null) return true;
                  const eventDate = new Date(date);
                  return eventDate.getMonth() === selectedMonth;
                })
                .map(([date, employees]) => {
                  const daysInWeek = getDaysInWeek(date);
                  
                  return (
                    <div key={date} className="event-block">
                      <div className="event-date-header">
                        <div className="event-main-date">
                          <span className="date-day">
                            {new Date(date).getDate()}
                          </span>
                          <div className="date-info">
                            <span className="date-month">
                              {months[new Date(date).getMonth()]}
                            </span>
                            <span className="date-weekday">
                              {formatDate(date).split(',')[0]}
                            </span>
                          </div>
                        </div>
                        <div className="week-range">
                          <span className="week-label">
                            📍 Bloque de 5-7 días
                          </span>
                          <span className="week-dates">
                            {getWeekLabel(date)}
                          </span>
                        </div>
                      </div>

                      {/* Week Timeline Visual */}
                      <div className="week-timeline">
                        {daysInWeek.map((day, idx) => {
                          const dayDate = new Date(day);
                          const isMainDate = day === date;
                          
                          return (
                            <div
                              key={day}
                              className={`timeline-day ${isMainDate ? 'main-date' : ''}`}
                            >
                              <div className="day-marker">
                                {isMainDate && <span className="marker-dot"></span>}
                              </div>
                              <span className="day-number">{dayDate.getDate()}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Employees List */}
                      <div className="event-employees">
                        {employees.map(employee => (
                          <div
                            key={employee.id}
                            className="employee-event-card"
                            onClick={() => navigate(`/dashboard/employees/${employee.id}`)}
                          >
                            <div className="employee-event-avatar">
                              {employee.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div className="employee-event-info">
                              <h4>{employee.fullName}</h4>
                              <p className="employee-event-email">{employee.email}</p>
                              <div className="employee-event-meta">
                                <span className="event-type">
                                  🎯 {employee.technicalOnboardingType || 'No especificado'}
                                </span>
                                {employee.technicalOnboardingStatus ? (
                                  <StatusBadge status="completed" text="Completado" icon="✓" />
                                ) : (
                                  <StatusBadge status="pending" text="Pendiente" icon="⏳" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="calendar-legend">
        <h4>📖 Leyenda</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-color active"></span>
            <span>Sesiones activas (5-7 días por bloque)</span>
          </div>
          <div className="legend-item">
            <StatusBadge status="completed" text="Completado" />
            <span>Onboarding finalizado</span>
          </div>
          <div className="legend-item">
            <StatusBadge status="pending" text="Pendiente" />
            <span>Onboarding pendiente</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingCalendar;
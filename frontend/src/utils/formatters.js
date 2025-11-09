// Formatear fecha
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

// Formatear fecha y hora
export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Formatear fecha relativa
export const formatRelativeTime = (dateString) => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Hace un momento';
  if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
  if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
  if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
  
  return formatDate(dateString);
};

// Obtener color de estado
export const getStatusColor = (status) => {
  const colors = {
    pendiente: 'warning',
    aprobado: 'success',
    rechazado: 'danger',
  };
  return colors[status] || 'default';
};

// Obtener texto de estado
export const getStatusText = (status) => {
  const texts = {
    pendiente: 'Pendiente',
    aprobado: 'Aprobado',
    rechazado: 'Rechazado',
  };
  return texts[status] || status;
};

// Obtener icono de estado
export const getStatusIcon = (status) => {
  const icons = {
    pendiente: '⏳',
    aprobado: '✅',
    rechazado: '❌',
  };
  return icons[status] || '📄';
};
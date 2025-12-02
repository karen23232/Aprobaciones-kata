const cron = require('node-cron');
const { checkAndSendAlerts } = require('../services/Onboardingalertservice.js');

/**
 * Configurar tareas programadas (cron jobs)
 */
const setupCronJobs = () => {
  // Ejecutar verificación de alertas todos los días a las 8:00 AM
  // Formato: segundos minutos horas día mes día-semana
  // '0 8 * * *' = todos los días a las 8:00 AM
  
  const alertCheckJob = cron.schedule('0 8 * * *', async () => {
    console.log('⏰ Ejecutando verificación automática de alertas de onboarding...');
    console.log('📅 Fecha y hora:', new Date().toLocaleString('es-CO'));
    
    try {
      const results = await checkAndSendAlerts();
      console.log('✅ Verificación de alertas completada:', results);
    } catch (error) {
      console.error('❌ Error en la verificación automática de alertas:', error);
    }
  }, {
    scheduled: true,
    timezone: "America/Bogota" // Zona horaria de Colombia
  });

  console.log('✅ Cron job de alertas configurado correctamente');
  console.log('⏰ Se ejecutará todos los días a las 8:00 AM (hora de Colombia)');

  // También puedes agregar otros cron jobs aquí si es necesario
  // Por ejemplo, un reporte semanal:
  
  /*
  const weeklyReportJob = cron.schedule('0 9 * * 1', async () => {
    console.log('📊 Generando reporte semanal de onboardings...');
    // Lógica para generar reporte
  }, {
    scheduled: true,
    timezone: "America/Bogota"
  });
  */

  return {
    alertCheckJob
  };
};

/**
 * Detener todos los cron jobs
 */
const stopCronJobs = (jobs) => {
  if (jobs && jobs.alertCheckJob) {
    jobs.alertCheckJob.stop();
    console.log('🛑 Cron jobs detenidos');
  }
};

module.exports = {
  setupCronJobs,
  stopCronJobs
};
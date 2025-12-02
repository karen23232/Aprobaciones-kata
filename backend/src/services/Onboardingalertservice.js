const nodemailer = require('nodemailer');
const Employee = require('../models/Employee');
const { Op } = require('sequelize');

// Configurar el transportador de correo
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
};

/**
 * Enviar alerta de correo para un onboarding técnico próximo
 * @param {Object} employee - Objeto del empleado
 * @param {string} recipientEmail - Email del destinatario (responsable)
 */
const sendOnboardingAlert = async (employee, recipientEmail = null) => {
  try {
    const transporter = createTransporter();
    
    // Si no se especifica un destinatario, usar un email por defecto o admin
    const to = recipientEmail || process.env.ADMIN_EMAIL || employee.email;
    
    const onboardingDate = new Date(employee.technicalOnboardingDate);
    const formattedDate = onboardingDate.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const mailOptions = {
      from: `"Sistema de Onboarding" <${process.env.SMTP_USER}>`,
      to: to,
      subject: `🔔 Recordatorio: Onboarding Técnico Próximo - ${employee.fullName}`,
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 10px 10px 0 0;
              text-align: center;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .info-box {
              background: white;
              border-left: 4px solid #667eea;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
            }
            .info-row {
              display: flex;
              padding: 8px 0;
              border-bottom: 1px solid #eee;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .label {
              font-weight: bold;
              color: #667eea;
              min-width: 150px;
            }
            .value {
              color: #555;
            }
            .button {
              display: inline-block;
              background: #667eea;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              color: #999;
              font-size: 12px;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
            }
            .alert-icon {
              font-size: 48px;
              margin-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="alert-icon">🔔</div>
            <h1 style="margin: 0;">Recordatorio de Onboarding Técnico</h1>
          </div>
          <div class="content">
            <p>Estimado/a,</p>
            <p>Le recordamos que se aproxima el <strong>onboarding técnico</strong> para el siguiente colaborador:</p>
            
            <div class="info-box">
              <div class="info-row">
                <span class="label">👤 Nombre:</span>
                <span class="value">${employee.fullName}</span>
              </div>
              <div class="info-row">
                <span class="label">📧 Email:</span>
                <span class="value">${employee.email}</span>
              </div>
              <div class="info-row">
                <span class="label">📅 Fecha programada:</span>
                <span class="value">${formattedDate}</span>
              </div>
              <div class="info-row">
                <span class="label">🎯 Tipo:</span>
                <span class="value">${employee.technicalOnboardingType || 'No especificado'}</span>
              </div>
              <div class="info-row">
                <span class="label">💼 Cargo:</span>
                <span class="value">${employee.position || 'No especificado'}</span>
              </div>
              <div class="info-row">
                <span class="label">🏢 Departamento:</span>
                <span class="value">${employee.department || 'No especificado'}</span>
              </div>
            </div>

            <p>Por favor, asegúrese de que todo esté preparado para la sesión de onboarding.</p>
            
            ${employee.notes ? `
              <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <strong>📝 Notas adicionales:</strong><br>
                ${employee.notes}
              </div>
            ` : ''}

            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #666; font-size: 14px;">
                Este es un recordatorio automático enviado una semana antes de la fecha programada.
              </p>
            </div>
          </div>
          
          <div class="footer">
            <p>Sistema de Gestión de Onboarding - Banco de Bogotá</p>
            <p>Este es un correo automático, por favor no responder.</p>
          </div>
        </body>
        </html>
      `,
      text: `
        Recordatorio de Onboarding Técnico
        
        Estimado/a,
        
        Le recordamos que se aproxima el onboarding técnico para:
        
        Nombre: ${employee.fullName}
        Email: ${employee.email}
        Fecha: ${formattedDate}
        Tipo: ${employee.technicalOnboardingType || 'No especificado'}
        Cargo: ${employee.position || 'No especificado'}
        Departamento: ${employee.department || 'No especificado'}
        
        ${employee.notes ? `Notas: ${employee.notes}` : ''}
        
        Sistema de Gestión de Onboarding - Banco de Bogotá
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Alerta enviada para ${employee.fullName}: ${info.messageId}`);
    
    // Marcar la alerta como enviada
    await employee.update({
      alertSent: true,
      alertSentDate: new Date()
    });

    return {
      success: true,
      messageId: info.messageId,
      employee: employee.fullName
    };
  } catch (error) {
    console.error(`❌ Error al enviar alerta para ${employee.fullName}:`, error);
    throw error;
  }
};

/**
 * Verificar y enviar alertas para todos los onboardings próximos
 * Esta función debe ejecutarse diariamente (por ejemplo, con un cron job)
 */
const checkAndSendAlerts = async () => {
  try {
    console.log('🔍 Verificando onboardings técnicos próximos...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(oneWeekLater.getDate() + 7);
    oneWeekLater.setHours(23, 59, 59, 999);

    // Buscar empleados con onboardings técnicos en la próxima semana
    // que no han sido completados y no se les ha enviado alerta
    const employees = await Employee.findAll({
      where: {
        technicalOnboardingDate: {
          [Op.between]: [today, oneWeekLater]
        },
        technicalOnboardingStatus: false,
        alertSent: false
      }
    });

    console.log(`📊 Encontrados ${employees.length} onboardings que requieren alerta`);

    const results = {
      total: employees.length,
      sent: 0,
      failed: 0,
      errors: []
    };

    for (const employee of employees) {
      try {
        await sendOnboardingAlert(employee);
        results.sent++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          employee: employee.fullName,
          error: error.message
        });
      }
    }

    console.log(`✅ Proceso completado: ${results.sent} enviados, ${results.failed} fallidos`);
    
    return results;
  } catch (error) {
    console.error('❌ Error en el proceso de verificación de alertas:', error);
    throw error;
  }
};

/**
 * Enviar alerta manual para un empleado específico
 */
const sendManualAlert = async (employeeId, recipientEmail = null) => {
  try {
    const employee = await Employee.findByPk(employeeId);
    
    if (!employee) {
      throw new Error('Empleado no encontrado');
    }

    if (!employee.technicalOnboardingDate) {
      throw new Error('El empleado no tiene una fecha de onboarding técnico asignada');
    }

    if (employee.technicalOnboardingStatus) {
      throw new Error('El onboarding técnico ya fue completado');
    }

    return await sendOnboardingAlert(employee, recipientEmail);
  } catch (error) {
    console.error('Error al enviar alerta manual:', error);
    throw error;
  }
};

/**
 * Resetear el estado de alerta (útil para testing o re-envíos)
 */
const resetAlert = async (employeeId) => {
  try {
    const employee = await Employee.findByPk(employeeId);
    
    if (!employee) {
      throw new Error('Empleado no encontrado');
    }

    await employee.update({
      alertSent: false,
      alertSentDate: null
    });

    return {
      success: true,
      message: 'Estado de alerta reseteado correctamente'
    };
  } catch (error) {
    console.error('Error al resetear alerta:', error);
    throw error;
  }
};

module.exports = {
  sendOnboardingAlert,
  checkAndSendAlerts,
  sendManualAlert,
  resetAlert
};
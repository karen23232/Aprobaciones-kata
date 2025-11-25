const nodemailer = require('nodemailer');

// ==================== CONFIGURACIÓN DEL TRANSPORTE ====================
const createTransporter = () => {
  // Verificar que las variables de entorno estén configuradas
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('⚠️ ERROR: Variables de entorno EMAIL_USER y EMAIL_PASS no configuradas');
    return null;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Tu email de Gmail
      pass: process.env.EMAIL_PASS  // Tu contraseña de aplicación
    },
    // Configuración adicional para mejor compatibilidad
    secure: true,
    tls: {
      rejectUnauthorized: false
    }
  });

  return transporter;
};

// ==================== ENVIAR EMAIL DE RECUPERACIÓN ====================
const sendPasswordResetEmail = async (userEmail, userName, resetToken) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      throw new Error('No se pudo configurar el servicio de email. Verifica las variables de entorno.');
    }

    // URL del frontend para resetear contraseña
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    // Contenido del email en HTML
    const mailOptions = {
      from: {
        name: 'Banco de Bogotá - Sistema de Aprobaciones',
        address: process.env.EMAIL_USER
      },
      to: userEmail,
      subject: '🔐 Recuperación de Contraseña - Banco de Bogotá',
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background-color: #ffffff;
              border-radius: 10px;
              padding: 40px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 3px solid #003d82;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #003d82;
              margin-bottom: 10px;
            }
            .title {
              color: #003d82;
              font-size: 24px;
              margin-bottom: 10px;
            }
            .content {
              margin: 30px 0;
            }
            .button-container {
              text-align: center;
              margin: 30px 0;
            }
            .reset-button {
              display: inline-block;
              padding: 15px 40px;
              background-color: #003d82;
              color: #ffffff !important;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
              font-size: 16px;
            }
            .reset-button:hover {
              background-color: #002555;
            }
            .token-box {
              background-color: #f8f9fa;
              border-left: 4px solid #003d82;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
              word-break: break-all;
              font-family: monospace;
              font-size: 14px;
            }
            .info-box {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #dee2e6;
              text-align: center;
              color: #6c757d;
              font-size: 12px;
            }
            .warning {
              color: #dc3545;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🏦 Banco de Bogotá</div>
              <div>Sistema de Servicios y Aprobaciones</div>
            </div>

            <h2 class="title">Recuperación de Contraseña</h2>

            <div class="content">
              <p>Hola <strong>${userName}</strong>,</p>
              
              <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.</p>
              
              <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
            </div>

            <div class="button-container">
              <a href="${resetUrl}" class="reset-button">
                🔐 Restablecer Contraseña
              </a>
            </div>

            <div class="content">
              <p>O copia y pega este enlace en tu navegador:</p>
              <div class="token-box">
                ${resetUrl}
              </div>
            </div>

            <div class="info-box">
              <p><strong>⏱️ Este enlace es válido por 1 hora.</strong></p>
              <p>Si no solicitaste este cambio, puedes ignorar este mensaje de forma segura.</p>
            </div>

            <div class="content">
              <p class="warning">⚠️ Por seguridad:</p>
              <ul>
                <li>Nunca compartas este enlace con nadie</li>
                <li>El enlace expirará en 1 hora</li>
                <li>Solo puedes usar este enlace una vez</li>
              </ul>
            </div>

            <div class="footer">
              <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
              <p>© ${new Date().getFullYear()} Banco de Bogotá - Sistema de Aprobaciones</p>
              <p>Si tienes problemas, contacta al administrador del sistema.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      // Versión en texto plano (fallback)
      text: `
Recuperación de Contraseña - Banco de Bogotá

Hola ${userName},

Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.

Para crear una nueva contraseña, copia y pega el siguiente enlace en tu navegador:
${resetUrl}

Este enlace es válido por 1 hora.

Si no solicitaste este cambio, puedes ignorar este mensaje de forma segura.

Por seguridad:
- Nunca compartas este enlace con nadie
- El enlace expirará en 1 hora
- Solo puedes usar este enlace una vez

---
Este es un correo automático, por favor no respondas a este mensaje.
© ${new Date().getFullYear()} Banco de Bogotá - Sistema de Aprobaciones
      `
    };

    // Enviar el email
    const info = await transporter.sendMail(mailOptions);

    console.log('\n' + '='.repeat(60));
    console.log('📧 EMAIL DE RECUPERACIÓN ENVIADO');
    console.log('='.repeat(60));
    console.log(`Destinatario: ${userEmail}`);
    console.log(`Usuario: ${userName}`);
    console.log(`Message ID: ${info.messageId}`);
    console.log(`Status: ${info.response}`);
    console.log('='.repeat(60) + '\n');

    return {
      success: true,
      messageId: info.messageId
    };

  } catch (error) {
    console.error('❌ Error al enviar email:', error);
    
    // Mensajes de error más específicos
    let errorMessage = 'Error al enviar el correo de recuperación';
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Error de autenticación con Gmail. Verifica tus credenciales.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Error de conexión con el servidor de correo.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};

// ==================== VERIFICAR CONFIGURACIÓN ====================
const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      return {
        configured: false,
        message: 'Variables de entorno no configuradas'
      };
    }

    await transporter.verify();
    
    console.log('✅ Servicio de email configurado correctamente');
    return {
      configured: true,
      message: 'Servicio de email listo'
    };
    
  } catch (error) {
    console.error('❌ Error en configuración de email:', error.message);
    return {
      configured: false,
      message: error.message
    };
  }
};

module.exports = {
  sendPasswordResetEmail,
  verifyEmailConfig
};
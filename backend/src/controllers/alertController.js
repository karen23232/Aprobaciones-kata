const {
  checkAndSendAlerts,
  sendManualAlert,
  resetAlert
} = require('../services/Onboardingalertservice.js');
const Employee = require('../models/Employee.js');

// @desc    Verificar y enviar alertas automáticamente
// @route   POST /api/alerts/check-and-send
// @access  Private (Admin only)
exports.triggerAlertCheck = async (req, res) => {
  try {
    const results = await checkAndSendAlerts();

    res.status(200).json({
      success: true,
      message: 'Proceso de alertas completado',
      data: results
    });
  } catch (error) {
    console.error('Error al verificar alertas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar las alertas',
      error: error.message
    });
  }
};

// @desc    Enviar alerta manual para un empleado específico
// @route   POST /api/alerts/send/:employeeId
// @access  Private
exports.sendManualAlertToEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { recipientEmail } = req.body;

    const result = await sendManualAlert(employeeId, recipientEmail);

    res.status(200).json({
      success: true,
      message: 'Alerta enviada exitosamente',
      data: result
    });
  } catch (error) {
    console.error('Error al enviar alerta manual:', error);
    
    const statusCode = error.message.includes('no encontrado') ? 404 : 500;
    
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Resetear estado de alerta de un empleado
// @route   POST /api/alerts/reset/:employeeId
// @access  Private (Admin only)
exports.resetEmployeeAlert = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const result = await resetAlert(employeeId);

    res.status(200).json({
      success: true,
      message: 'Estado de alerta reseteado correctamente',
      data: result
    });
  } catch (error) {
    console.error('Error al resetear alerta:', error);
    
    const statusCode = error.message.includes('no encontrado') ? 404 : 500;
    
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener empleados que necesitan alerta
// @route   GET /api/alerts/pending
// @access  Private
exports.getPendingAlerts = async (req, res) => {
  try {
    const { Op } = require('sequelize');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(oneWeekLater.getDate() + 7);
    oneWeekLater.setHours(23, 59, 59, 999);

    const employees = await Employee.findAll({
      where: {
        technicalOnboardingDate: {
          [Op.between]: [today, oneWeekLater]
        },
        technicalOnboardingStatus: false,
        alertSent: false
      },
      order: [['technicalOnboardingDate', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: employees,
      count: employees.length
    });
  } catch (error) {
    console.error('Error al obtener alertas pendientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las alertas pendientes',
      error: error.message
    });
  }
};

// @desc    Obtener historial de alertas enviadas
// @route   GET /api/alerts/history
// @access  Private
exports.getAlertHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: employees } = await Employee.findAndCountAll({
      where: {
        alertSent: true
      },
      order: [['alertSentDate', 'DESC']],
      limit: parseInt(limit),
      offset: offset,
      attributes: [
        'id',
        'fullName',
        'email',
        'technicalOnboardingDate',
        'technicalOnboardingType',
        'alertSentDate',
        'technicalOnboardingStatus'
      ]
    });

    res.status(200).json({
      success: true,
      data: employees,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener historial de alertas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el historial de alertas',
      error: error.message
    });
  }
};

module.exports = exports;
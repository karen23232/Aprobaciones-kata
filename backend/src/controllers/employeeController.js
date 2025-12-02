const Employee = require('../models/Employee');
const { Op } = require('sequelize');

// @desc    Obtener todos los colaboradores
// @route   GET /api/employees
// @access  Private
exports.getAllEmployees = async (req, res) => {
  try {
    const { 
      status, // 'all', 'pending', 'completed', 'general-completed', 'technical-completed'
      search, // búsqueda por nombre o email
      sortBy = 'entryDate', // campo para ordenar
      order = 'DESC', // ASC o DESC
      page = 1,
      limit = 10
    } = req.query;

    // Construir filtros
    const where = {};

    // Filtro por estado
    if (status) {
      switch (status) {
        case 'pending':
          where[Op.or] = [
            { generalOnboardingStatus: false },
            { technicalOnboardingStatus: false }
          ];
          break;
        case 'completed':
          where.generalOnboardingStatus = true;
          where.technicalOnboardingStatus = true;
          break;
        case 'general-completed':
          where.generalOnboardingStatus = true;
          break;
        case 'technical-completed':
          where.technicalOnboardingStatus = true;
          break;
        case 'general-pending':
          where.generalOnboardingStatus = false;
          break;
        case 'technical-pending':
          where.technicalOnboardingStatus = false;
          break;
      }
    }

    // Filtro por búsqueda
    if (search) {
      where[Op.or] = [
        { fullName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { position: { [Op.iLike]: `%${search}%` } },
        { department: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Calcular offset para paginación
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Obtener empleados con paginación
    const { count, rows: employees } = await Employee.findAndCountAll({
      where,
      order: [[sortBy, order.toUpperCase()]],
      limit: parseInt(limit),
      offset: offset
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
    console.error('Error al obtener empleados:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los colaboradores',
      error: error.message
    });
  }
};

// @desc    Obtener un colaborador por ID
// @route   GET /api/employees/:id
// @access  Private
exports.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Colaborador no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error('Error al obtener colaborador:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el colaborador',
      error: error.message
    });
  }
};

// @desc    Crear un nuevo colaborador
// @route   POST /api/employees
// @access  Private
exports.createEmployee = async (req, res) => {
  try {
    const {
      fullName,
      email,
      entryDate,
      position,
      department,
      technicalOnboardingDate,
      technicalOnboardingType,
      notes
    } = req.body;

    // Validar campos requeridos
    if (!fullName || !email || !entryDate) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporcione nombre completo, correo y fecha de ingreso'
      });
    }

    // Verificar si el email ya existe
    const existingEmployee = await Employee.findOne({ where: { email } });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un colaborador con este correo electrónico'
      });
    }

    // Crear el colaborador
    const employee = await Employee.create({
      fullName,
      email,
      entryDate,
      position,
      department,
      technicalOnboardingDate,
      technicalOnboardingType,
      notes,
      generalOnboardingStatus: false,
      technicalOnboardingStatus: false,
      alertSent: false
    });

    res.status(201).json({
      success: true,
      message: 'Colaborador registrado exitosamente',
      data: employee
    });
  } catch (error) {
    console.error('Error al crear colaborador:', error);
    
    // Manejar errores de validación de Sequelize
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear el colaborador',
      error: error.message
    });
  }
};

// @desc    Actualizar un colaborador
// @route   PUT /api/employees/:id
// @access  Private
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      email,
      entryDate,
      position,
      department,
      technicalOnboardingDate,
      technicalOnboardingType,
      generalOnboardingStatus,
      technicalOnboardingStatus,
      notes
    } = req.body;

    const employee = await Employee.findByPk(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Colaborador no encontrado'
      });
    }

    // Si se está cambiando el email, verificar que no exista
    if (email && email !== employee.email) {
      const existingEmployee = await Employee.findOne({ where: { email } });
      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un colaborador con este correo electrónico'
        });
      }
    }

    // Actualizar campos
    await employee.update({
      fullName: fullName || employee.fullName,
      email: email || employee.email,
      entryDate: entryDate || employee.entryDate,
      position: position !== undefined ? position : employee.position,
      department: department !== undefined ? department : employee.department,
      technicalOnboardingDate: technicalOnboardingDate !== undefined ? technicalOnboardingDate : employee.technicalOnboardingDate,
      technicalOnboardingType: technicalOnboardingType !== undefined ? technicalOnboardingType : employee.technicalOnboardingType,
      generalOnboardingStatus: generalOnboardingStatus !== undefined ? generalOnboardingStatus : employee.generalOnboardingStatus,
      technicalOnboardingStatus: technicalOnboardingStatus !== undefined ? technicalOnboardingStatus : employee.technicalOnboardingStatus,
      notes: notes !== undefined ? notes : employee.notes
    });

    res.status(200).json({
      success: true,
      message: 'Colaborador actualizado exitosamente',
      data: employee
    });
  } catch (error) {
    console.error('Error al actualizar colaborador:', error);
    
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al actualizar el colaborador',
      error: error.message
    });
  }
};

// @desc    Eliminar un colaborador
// @route   DELETE /api/employees/:id
// @access  Private
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Colaborador no encontrado'
      });
    }

    await employee.destroy();

    res.status(200).json({
      success: true,
      message: 'Colaborador eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar colaborador:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el colaborador',
      error: error.message
    });
  }
};

// @desc    Marcar onboarding general como completado
// @route   PATCH /api/employees/:id/complete-general
// @access  Private
exports.completeGeneralOnboarding = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Colaborador no encontrado'
      });
    }

    await employee.markGeneralOnboardingComplete();

    res.status(200).json({
      success: true,
      message: 'Onboarding general marcado como completado',
      data: employee
    });
  } catch (error) {
    console.error('Error al completar onboarding general:', error);
    res.status(500).json({
      success: false,
      message: 'Error al completar el onboarding general',
      error: error.message
    });
  }
};

// @desc    Marcar onboarding técnico como completado
// @route   PATCH /api/employees/:id/complete-technical
// @access  Private
exports.completeTechnicalOnboarding = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Colaborador no encontrado'
      });
    }

    await employee.markTechnicalOnboardingComplete();

    res.status(200).json({
      success: true,
      message: 'Onboarding técnico marcado como completado',
      data: employee
    });
  } catch (error) {
    console.error('Error al completar onboarding técnico:', error);
    res.status(500).json({
      success: false,
      message: 'Error al completar el onboarding técnico',
      error: error.message
    });
  }
};

// @desc    Obtener estadísticas del dashboard
// @route   GET /api/employees/stats/dashboard
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const totalEmployees = await Employee.count();
    
    const generalCompleted = await Employee.count({
      where: { generalOnboardingStatus: true }
    });
    
    const technicalCompleted = await Employee.count({
      where: { technicalOnboardingStatus: true }
    });
    
    const bothCompleted = await Employee.count({
      where: {
        generalOnboardingStatus: true,
        technicalOnboardingStatus: true
      }
    });
    
    const pending = await Employee.count({
      where: {
        [Op.or]: [
          { generalOnboardingStatus: false },
          { technicalOnboardingStatus: false }
        ]
      }
    });

    // Empleados que necesitan alerta pronto
    const upcomingOnboardings = await Employee.count({
      where: {
        technicalOnboardingStatus: false,
        technicalOnboardingDate: {
          [Op.between]: [
            new Date(),
            new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // próximos 14 días
          ]
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        generalCompleted,
        technicalCompleted,
        bothCompleted,
        pending,
        upcomingOnboardings,
        percentageComplete: totalEmployees > 0 
          ? Math.round((bothCompleted / totalEmployees) * 100) 
          : 0
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las estadísticas',
      error: error.message
    });
  }
};

// @desc    Obtener calendario de onboardings técnicos
// @route   GET /api/employees/calendar/technical
// @access  Private
exports.getTechnicalOnboardingCalendar = async (req, res) => {
  try {
    const { year, month } = req.query;
    
    let whereClause = {
      technicalOnboardingDate: { [Op.ne]: null }
    };

    // Filtrar por año si se proporciona
    if (year) {
      const startOfYear = new Date(`${year}-01-01`);
      const endOfYear = new Date(`${year}-12-31`);
      
      whereClause.technicalOnboardingDate = {
        [Op.between]: [startOfYear, endOfYear]
      };
    }

    // Filtrar por mes si se proporciona (requiere año)
    if (year && month) {
      const startOfMonth = new Date(`${year}-${month.padStart(2, '0')}-01`);
      const endOfMonth = new Date(year, parseInt(month), 0);
      
      whereClause.technicalOnboardingDate = {
        [Op.between]: [startOfMonth, endOfMonth]
      };
    }

    const employees = await Employee.findAll({
      where: whereClause,
      order: [['technicalOnboardingDate', 'ASC']],
      attributes: [
        'id',
        'fullName',
        'email',
        'technicalOnboardingDate',
        'technicalOnboardingType',
        'technicalOnboardingStatus'
      ]
    });

    // Agrupar por fecha
    const calendar = employees.reduce((acc, employee) => {
      const date = employee.technicalOnboardingDate;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(employee);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: calendar,
      total: employees.length
    });
  } catch (error) {
    console.error('Error al obtener calendario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el calendario de onboardings técnicos',
      error: error.message
    });
  }
};

module.exports = exports;
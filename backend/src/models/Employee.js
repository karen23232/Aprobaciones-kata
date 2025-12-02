const { DataTypes } = require('sequelize');
const sequelize = require('../config/database.js');

const Employee = sequelize.define('Employee', {
  // ... resto del código
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // Información básica del colaborador
  fullName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El nombre completo es obligatorio'
      },
      len: {
        args: [3, 255],
        msg: 'El nombre debe tener entre 3 y 255 caracteres'
      }
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: {
      msg: 'Este correo electrónico ya está registrado'
    },
    validate: {
      notEmpty: {
        msg: 'El correo electrónico es obligatorio'
      },
      isEmail: {
        msg: 'Debe proporcionar un correo electrónico válido'
      }
    }
  },
  entryDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La fecha de ingreso es obligatoria'
      },
      isDate: {
        msg: 'Debe proporcionar una fecha válida'
      }
    }
  },
  
  // Estados de los onboardings (true = completado, false = pendiente)
  generalOnboardingStatus: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Estado del Onboarding de Bienvenida General'
  },
  technicalOnboardingStatus: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Estado del Onboarding Técnico (Journey to Cloud u otros)'
  },
  
  // Fecha asignada para el onboarding técnico (opcional)
  technicalOnboardingDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: {
        msg: 'Debe proporcionar una fecha válida para el onboarding técnico'
      },
      isAfterEntryDate(value) {
        if (value && this.entryDate && new Date(value) < new Date(this.entryDate)) {
          throw new Error('La fecha del onboarding técnico no puede ser anterior a la fecha de ingreso');
        }
      }
    }
  },
  
  // Tipo de onboarding técnico (Journey to Cloud, etc.)
  technicalOnboardingType: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isIn: {
        args: [['Journey to Cloud', 'DevOps Fundamentals', 'Security Basics', 'Architecture Principles', 'Otro']],
        msg: 'El tipo de onboarding técnico no es válido'
      }
    }
  },
  
  // Información adicional
  position: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Cargo del colaborador'
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Departamento o área'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas adicionales sobre el colaborador o su onboarding'
  },
  
  // Alertas
  alertSent: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Indica si se envió la alerta de correo para el onboarding técnico'
  },
  alertSentDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha en que se envió la última alerta'
  }
}, {
  tableName: 'employees',
  timestamps: true,
  indexes: [
    {
      fields: ['email']
    },
    {
      fields: ['entryDate']
    },
    {
      fields: ['technicalOnboardingDate']
    },
    {
      fields: ['generalOnboardingStatus', 'technicalOnboardingStatus']
    }
  ]
});

// Métodos de instancia útiles
Employee.prototype.markGeneralOnboardingComplete = function() {
  this.generalOnboardingStatus = true;
  return this.save();
};

Employee.prototype.markTechnicalOnboardingComplete = function() {
  this.technicalOnboardingStatus = true;
  return this.save();
};

Employee.prototype.isOnboardingComplete = function() {
  return this.generalOnboardingStatus && this.technicalOnboardingStatus;
};

Employee.prototype.needsAlert = function() {
  if (!this.technicalOnboardingDate || this.technicalOnboardingStatus || this.alertSent) {
    return false;
  }
  
  const today = new Date();
  const onboardingDate = new Date(this.technicalOnboardingDate);
  const oneWeekBefore = new Date(onboardingDate);
  oneWeekBefore.setDate(oneWeekBefore.getDate() - 7);
  
  return today >= oneWeekBefore && today < onboardingDate;
};

module.exports = Employee;
// Production configuration for BabyAssist AI

export const productionConfig = {
  // Security settings
  security: {
    // Session timeout (in minutes)
    sessionTimeout: 60 * 24, // 24 hours
    
    // Password requirements
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecialChars: true,
    
    // Rate limiting
    maxLoginAttempts: 5,
    lockoutDuration: 30, // minutes
    resetWindow: 15, // minutes
  },

  // Database settings
  database: {
    // Connection pool settings
    maxConnections: 20,
    idleTimeout: 30000, // 30 seconds
    
    // Query timeout
    queryTimeout: 30000, // 30 seconds
  },

  // API settings
  api: {
    // Request timeout
    timeout: 10000, // 10 seconds
    
    // Rate limiting
    requestsPerMinute: 100,
    
    // CORS settings
    allowedOrigins: [
      'https://your-domain.com',
      'https://www.your-domain.com'
    ],
  },

  // Logging settings
  logging: {
    level: 'info', // 'debug' | 'info' | 'warn' | 'error'
    enableConsole: true,
    enableFile: true,
    logFile: 'logs/app.log',
  },

  // Feature flags
  features: {
    enableEmailVerification: true,
    enablePasswordReset: true,
    enableTwoFactorAuth: false, // Can be enabled later
    enableAuditLogs: true,
    enableBackup: true,
  },

  // Email settings
  email: {
    fromAddress: 'noreply@babyassist.local',
    replyToAddress: 'support@babyassist.local',
    templates: {
      welcome: 'welcome-email',
      passwordReset: 'password-reset',
      emailVerification: 'email-verification',
    },
  },

  // Monitoring settings
  monitoring: {
    enableHealthChecks: true,
    enableMetrics: true,
    enableErrorTracking: true,
    alertThresholds: {
      errorRate: 0.05, // 5%
      responseTime: 2000, // 2 seconds
      cpuUsage: 0.8, // 80%
      memoryUsage: 0.8, // 80%
    },
  },
};

// Environment-specific overrides
export const getConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  if (env === 'production') {
    return {
      ...productionConfig,
      logging: {
        ...productionConfig.logging,
        level: 'warn',
      },
      security: {
        ...productionConfig.security,
        sessionTimeout: 60 * 8, // 8 hours for production
      },
    };
  }
  
  if (env === 'development') {
    return {
      ...productionConfig,
      logging: {
        ...productionConfig.logging,
        level: 'debug',
      },
      security: {
        ...productionConfig.security,
        sessionTimeout: 60 * 24 * 7, // 7 days for development
      },
    };
  }
  
  return productionConfig;
}; 
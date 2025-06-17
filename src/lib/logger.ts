// Client-safe logger that works in both server and browser environments

type LogLevel = 'error' | 'warn' | 'info' | 'debug'

interface LogContext {
  [key: string]: any
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production'
  private logLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || (this.isDevelopment ? 'debug' : 'info')
  
  private levels: Record<LogLevel, number> = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] <= this.levels[this.logLevel]
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    let formatted = `${timestamp} [${level.toUpperCase()}]: ${message}`
    
    if (context && Object.keys(context).length > 0) {
      formatted += ` ${JSON.stringify(context)}`
    }
    
    return formatted
  }

  error(message: string, context?: LogContext) {
    if (this.shouldLog('error')) {
      if (typeof window !== 'undefined') {
        console.error(this.formatMessage('error', message, context))
      } else {
        // Server-side logging
        console.error(this.formatMessage('error', message, context))
      }
    }
  }

  warn(message: string, context?: LogContext) {
    if (this.shouldLog('warn')) {
      if (typeof window !== 'undefined') {
        console.warn(this.formatMessage('warn', message, context))
      } else {
        console.warn(this.formatMessage('warn', message, context))
      }
    }
  }

  info(message: string, context?: LogContext) {
    if (this.shouldLog('info')) {
      if (typeof window !== 'undefined') {
        console.log(this.formatMessage('info', message, context))
      } else {
        console.log(this.formatMessage('info', message, context))
      }
    }
  }

  debug(message: string, context?: LogContext) {
    if (this.shouldLog('debug')) {
      if (typeof window !== 'undefined') {
        console.log(this.formatMessage('debug', message, context))
      } else {
        console.log(this.formatMessage('debug', message, context))
      }
    }
  }
}

// Create singleton logger instance
export const logger = new Logger()

// Helper functions for structured logging
export function logError(error: Error, context?: Record<string, any>) {
  logger.error(error.message, {
    stack: error.stack,
    ...context,
  })
}

export function logRequest(req: any, res: any, responseTime: number) {
  logger.info('HTTP Request', {
    method: req.method,
    url: req.url,
    status: res.statusCode,
    responseTime: `${responseTime}ms`,
    userAgent: req.headers?.['user-agent'],
    ip: req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress,
  })
}

export function logDatabaseQuery(query: string, params?: any[], duration?: number) {
  logger.debug('Database Query', {
    query,
    params,
    duration: duration ? `${duration}ms` : undefined,
  })
}

export function logAIRequest(provider: string, model: string, tokens?: number, cost?: number) {
  logger.info('AI Request', {
    provider,
    model,
    tokens,
    cost,
  })
}

// Stream object for compatibility
export const loggerStream = {
  write: (message: string) => {
    logger.info(message.trim())
  },
}
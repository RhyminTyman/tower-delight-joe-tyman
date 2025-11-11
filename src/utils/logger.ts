/**
 * Centralized logging utility
 * Provides consistent logging across the application with context
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  component?: string;
  action?: string;
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  /**
   * Log informational messages
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, context || '');
    }
  }

  /**
   * Log warning messages
   */
  warn(message: string, context?: LogContext): void {
    console.warn(`[WARN] ${message}`, context || '');
  }

  /**
   * Log error messages with optional error object
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    console.error(`[ERROR] ${message}`, {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : error,
      ...context,
    });
    
    // In production, you could send to error tracking service (Sentry, etc.)
    // if (!this.isDevelopment) {
    //   sendToErrorTracking({ message, error, context });
    // }
  }

  /**
   * Log debug messages (only in development)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context || '');
    }
  }

  /**
   * Create a scoped logger with default context
   */
  scope(defaultContext: LogContext) {
    return {
      info: (message: string, additionalContext?: LogContext) =>
        this.info(message, { ...defaultContext, ...additionalContext }),
      warn: (message: string, additionalContext?: LogContext) =>
        this.warn(message, { ...defaultContext, ...additionalContext }),
      error: (message: string, error?: Error | unknown, additionalContext?: LogContext) =>
        this.error(message, error, { ...defaultContext, ...additionalContext }),
      debug: (message: string, additionalContext?: LogContext) =>
        this.debug(message, { ...defaultContext, ...additionalContext }),
    };
  }
}

// Export singleton instance
export const logger = new Logger();

// Export scoped loggers for common areas
export const createLogger = (component: string) => logger.scope({ component });


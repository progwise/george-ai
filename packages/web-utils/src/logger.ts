/**
 * Logging utility with configurable log levels
 * Supports: ERROR, WARN, INFO, DEBUG
 */

export type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG'

const LOG_LEVELS: Record<LogLevel, number> = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
}

/**
 * Get current log level from environment variable
 * Defaults to INFO if not set
 */
function getCurrentLogLevel(): LogLevel {
  const envLevel = process.env.LOG_LEVEL?.toUpperCase() as LogLevel | undefined
  return envLevel && envLevel in LOG_LEVELS ? envLevel : 'INFO'
}

/**
 * Check if a message should be logged based on current log level
 */
function shouldLog(messageLevel: LogLevel): boolean {
  const currentLevel = getCurrentLogLevel()
  return LOG_LEVELS[messageLevel] <= LOG_LEVELS[currentLevel]
}

/**
 * Format log message with timestamp and level
 */
function formatMessage(level: LogLevel, context: string, message: string, ...args: unknown[]): string {
  const timestamp = new Date().toISOString()
  const prefix = `[${timestamp}] [${level}] [${context}]`
  return args.length > 0 ? `${prefix} ${message}` : `${prefix} ${message}`
}

/**
 * Logger class with context
 */
export class Logger {
  constructor(private context: string) {}

  error(message: string, ...args: unknown[]): void {
    if (shouldLog('ERROR')) {
      console.error(formatMessage('ERROR', this.context, message), ...args)
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (shouldLog('WARN')) {
      console.warn(formatMessage('WARN', this.context, message), ...args)
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (shouldLog('INFO')) {
      console.info(formatMessage('INFO', this.context, message), ...args)
    }
  }

  debug(message: string, ...args: unknown[]): void {
    if (shouldLog('DEBUG')) {
      console.debug(formatMessage('DEBUG', this.context, message), ...args)
    }
  }
}

/**
 * Create a logger instance with a specific context
 *
 * @example
 * const logger = createLogger('API Crawler')
 * logger.debug('Starting crawl...')
 * logger.info('Fetched 10 items')
 * logger.error('Failed to authenticate')
 */
export function createLogger(context: string): Logger {
  return new Logger(context)
}

/**
 * SMB2 Client Error
 *
 * Custom error class that provides Node.js-compatible error codes while
 * preserving SMB2 status codes for debugging.
 */
import { NTStatus } from '../protocol/constants'

/**
 * Mapping of SMB2 NT Status codes to Node.js error codes
 */
interface ErrorMapping {
  code: string // Node.js error code (e.g., 'ENOENT', 'EACCES')
  message: string // Human-readable error message
}

/**
 * SMB2 to Node.js error code mappings
 */
const STATUS_CODE_MAPPINGS: Record<number, ErrorMapping> = {
  [NTStatus.OBJECT_NAME_NOT_FOUND]: {
    code: 'ENOENT',
    message: 'No such file or directory',
  },
  [NTStatus.OBJECT_PATH_NOT_FOUND]: {
    code: 'ENOENT',
    message: 'Path not found',
  },
  [NTStatus.NO_SUCH_FILE]: {
    code: 'ENOENT',
    message: 'No such file',
  },
  [NTStatus.ACCESS_DENIED]: {
    code: 'EACCES',
    message: 'Permission denied',
  },
  [NTStatus.LOGON_FAILURE]: {
    code: 'EACCES',
    message: 'Authentication failed',
  },
  [NTStatus.WRONG_PASSWORD]: {
    code: 'EACCES',
    message: 'Incorrect password',
  },
  [NTStatus.ACCOUNT_DISABLED]: {
    code: 'EACCES',
    message: 'Account disabled',
  },
  [NTStatus.PASSWORD_EXPIRED]: {
    code: 'EACCES',
    message: 'Password expired',
  },
  [NTStatus.INVALID_PARAMETER]: {
    code: 'EINVAL',
    message: 'Invalid parameter',
  },
  [NTStatus.INVALID_SMB]: {
    code: 'EINVAL',
    message: 'Invalid SMB message',
  },
  [NTStatus.SHARING_VIOLATION]: {
    code: 'EBUSY',
    message: 'File is in use by another process',
  },
  [NTStatus.NOT_SUPPORTED]: {
    code: 'ENOTSUP',
    message: 'Operation not supported',
  },
  [NTStatus.NETWORK_NAME_DELETED]: {
    code: 'ECONNRESET',
    message: 'Network connection was reset',
  },
  [NTStatus.USER_SESSION_DELETED]: {
    code: 'ECONNRESET',
    message: 'Session was terminated',
  },
}

/**
 * Custom error class for SMB2 client errors
 *
 * Provides Node.js-compatible error codes while preserving SMB2 status details.
 *
 * @example
 * ```typescript
 * // From SMB2 status code
 * const error = SMB2ClientError.fromSMBStatus(0xc0000034, 'readFile', '/path/to/file')
 * console.log(error.code) // 'ENOENT'
 * console.log(error.statusCode) // 0xc0000034
 * console.log(error.operation) // 'readFile'
 * console.log(error.path) // '/path/to/file'
 *
 * // Custom error
 * const error = new SMB2ClientError('Connection failed', 'ECONNREFUSED', undefined, 'connect')
 * ```
 */
export class SMB2ClientError extends Error {
  /**
   * Node.js-compatible error code
   * @example 'ENOENT', 'EACCES', 'EINVAL'
   */
  public readonly code: string

  /**
   * SMB2 NT Status code (if applicable)
   * @example 0xc0000034 (OBJECT_NAME_NOT_FOUND)
   */
  public readonly statusCode?: number

  /**
   * Operation that caused the error
   * @example 'readFile', 'readdir', 'connect'
   */
  public readonly operation?: string

  /**
   * File path that caused the error (if applicable)
   * @example '/path/to/file'
   */
  public readonly path?: string

  /**
   * Original error that caused this error (if wrapped)
   */
  public readonly cause?: Error

  /**
   * Create a new SMB2ClientError
   *
   * @param message - Human-readable error message
   * @param code - Node.js error code (e.g., 'ENOENT', 'EACCES')
   * @param statusCode - SMB2 NT Status code (optional)
   * @param operation - Operation that failed (optional)
   * @param path - File path (optional)
   * @param cause - Original error (optional)
   */
  constructor(message: string, code: string, statusCode?: number, operation?: string, path?: string, cause?: Error) {
    super(message)
    this.name = 'SMB2ClientError'
    this.code = code
    this.statusCode = statusCode
    this.operation = operation
    this.path = path
    this.cause = cause

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SMB2ClientError)
    }
  }

  /**
   * Create SMB2ClientError from SMB2 NT Status code
   *
   * Maps SMB2 status codes to Node.js-compatible error codes and messages.
   *
   * @param status - SMB2 NT Status code
   * @param operation - Operation that failed
   * @param path - File path (optional)
   * @returns SMB2ClientError with mapped code and message
   *
   * @example
   * ```typescript
   * const error = SMB2ClientError.fromSMBStatus(0xc0000034, 'readFile', '/missing.txt')
   * console.log(error.code) // 'ENOENT'
   * console.log(error.message) // 'No such file or directory: /missing.txt (readFile)'
   * ```
   */
  static fromSMBStatus(status: number, operation: string, path?: string): SMB2ClientError {
    const mapping = STATUS_CODE_MAPPINGS[status]

    if (mapping) {
      // Known status code - use mapped error
      const pathPart = path ? `: ${path}` : ''
      const message = `${mapping.message}${pathPart} (${operation})`

      return new SMB2ClientError(message, mapping.code, status, operation, path)
    }

    // Unknown status code - generic error
    const statusHex = `0x${status.toString(16).padStart(8, '0')}`
    const pathPart = path ? `: ${path}` : ''
    const message = `SMB2 error ${statusHex}${pathPart} (${operation})`

    return new SMB2ClientError(message, 'EIO', status, operation, path)
  }

  /**
   * Get formatted error message with all context
   *
   * @returns Formatted error message
   *
   * @example
   * ```typescript
   * const error = SMB2ClientError.fromSMBStatus(0xc0000034, 'readFile', '/missing.txt')
   * console.log(error.toString())
   * // 'SMB2ClientError [ENOENT]: No such file or directory: /missing.txt (readFile)'
   * ```
   */
  toString(): string {
    const parts = [`${this.name} [${this.code}]: ${this.message}`]

    if (this.statusCode !== undefined) {
      const statusHex = `0x${this.statusCode.toString(16).padStart(8, '0')}`
      parts.push(`Status: ${statusHex}`)
    }

    if (this.cause) {
      parts.push(`Caused by: ${this.cause.message}`)
    }

    return parts.join('\n')
  }
}

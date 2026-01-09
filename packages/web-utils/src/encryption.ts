import crypto from 'node:crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const ENCRYPTED_PREFIX = 'encrypted:'

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is required')
  }
  if (key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)')
  }
  return Buffer.from(key, 'hex')
}

/**
 * Encrypt a string value using AES-256-GCM
 */
export function encryptValue(plaintext: string): string {
  if (plaintext.startsWith(ENCRYPTED_PREFIX)) {
    return plaintext
  }
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(plaintext, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag()

  return `${ENCRYPTED_PREFIX}${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

/**
 * Decrypt a value that was encrypted with encryptValue
 */
export function decryptValue(encrypted: string): string {
  if (!encrypted.startsWith(ENCRYPTED_PREFIX)) {
    return encrypted
  }

  const key = getEncryptionKey()
  const parts = encrypted.slice(ENCRYPTED_PREFIX.length).split(':')

  if (parts.length !== 3) {
    throw new Error('Invalid encrypted value format')
  }

  const [ivHex, authTagHex, ciphertext] = parts
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(ciphertext, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

/**
 * Check if a value is encrypted
 */
export function isEncrypted(value: string): boolean {
  return value.startsWith(ENCRYPTED_PREFIX)
}

/**
 * Encrypt sensitive fields in a config object
 */
export function encryptConfigFields(
  config: Record<string, unknown>,
  sensitiveFields: string[],
): Record<string, unknown> {
  const result = { ...config }

  for (const field of sensitiveFields) {
    const value = result[field]
    if (typeof value === 'string' && value.length > 0 && !isEncrypted(value)) {
      result[field] = encryptValue(value)
    }
  }

  return result
}

/**
 * Decrypt sensitive fields in a config object
 */
export function decryptConfigFields(
  config: Record<string, unknown>,
  sensitiveFields: string[],
): Record<string, unknown> {
  const result = { ...config }

  for (const field of sensitiveFields) {
    const value = result[field]
    if (typeof value === 'string' && isEncrypted(value)) {
      result[field] = decryptValue(value)
    }
  }

  return result
}

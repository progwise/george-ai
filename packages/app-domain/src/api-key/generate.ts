import bcrypt from 'bcrypt'
import crypto from 'node:crypto'

export const generateKey = async (): Promise<{ key: string; keyHash: string }> => {
  // Generate a random API key (32 bytes = 64 hex characters)
  const key = crypto.randomBytes(32).toString('hex')

  // Hash the key for storage
  const keyHash = await bcrypt.hash(key, 10)

  return { key, keyHash }
}

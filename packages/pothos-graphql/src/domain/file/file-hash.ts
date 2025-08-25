import crypto from 'node:crypto'
import fs from 'node:fs'

/**
 * Calculate SHA-256 hash of a file
 * @param filePath Path to the file to hash
 * @returns Promise resolving to hex-encoded hash
 */
export async function calculateFileHash(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256')
    const stream = fs.createReadStream(filePath)

    stream.on('data', (data) => hash.update(data))
    stream.on('end', () => resolve(hash.digest('hex')))
    stream.on('error', reject)
  })
}

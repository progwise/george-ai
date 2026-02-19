import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'

import { logger } from './commons'

export async function calculateFileHash(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256')

    const stream = createReadStream(filePath)

    stream.on('data', (data) => {
      hash.update(data)
    })

    stream.on('end', () => {
      resolve(hash.digest('hex'))
    })

    stream.on('error', (err) => {
      logger.error('Error calculating file hash', { filePath, error: err })
      reject(err)
    })
  })
}

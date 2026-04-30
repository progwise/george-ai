import { createReadStream } from 'node:fs'
import { Readable } from 'node:stream'

import { logger } from './commons'
import { getFileStats } from './get-file-stats'
import { lookupMimeType } from './mimetype'

export async function readFile(filePath: string): Promise<{ stream: Readable; size: number; mimeType: string } | null> {
  const stats = await getFileStats(filePath)
  if (!stats) {
    logger.warn(`File not found`, { filePath })
    return null
  }
  const mimeType = lookupMimeType(filePath)

  const stream = createReadStream(filePath)
  stream.on('error', (err) => {
    logger.error(`Error reading file`, { filePath, error: err })
  })
  return { stream, size: stats.diskSize, mimeType }
}

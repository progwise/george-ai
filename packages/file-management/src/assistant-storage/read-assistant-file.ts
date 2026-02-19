import { Readable } from 'node:stream'

import { getFilePath, readFile } from '../file-system'
import { logger } from './commons'
import { getAssistantPath } from './get-assistant-path'

export async function readAssistantFile(
  assistantId: string,
  parameters: { fileName: string },
): Promise<{ stream: Readable; size: number; mimeType: string; fileName: string } | null> {
  const { fileName } = parameters
  const assistantFolderPath = await getAssistantPath(assistantId)
  const filePath = getFilePath(assistantFolderPath, fileName)

  const readFileResult = await readFile(filePath)
  if (!readFileResult) {
    logger.warn(`Assistant file not found`, { assistantId, fileName })
    return null
  }

  const { stream, size, mimeType } = readFileResult
  stream.on('error', (err) => {
    logger.error(`Error reading assistant file`, { assistantId, error: err })
  })
  return { stream, size, mimeType, fileName }
}

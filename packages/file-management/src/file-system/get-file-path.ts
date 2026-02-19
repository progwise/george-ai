import path from 'node:path'

import { logger } from './commons'
import { existsFile } from './exists-file'

export function getFilePath(...pathParts: string[]): string {
  return path.join(...pathParts)
}

export async function getFilePathOrThrow(pathParts: string[], errorMessage?: string): Promise<string> {
  const effectivePath = getFilePath(...pathParts)

  const exists = await existsFile(effectivePath)
  if (!exists) {
    if (!errorMessage) {
      errorMessage = `Path does not exist: ${effectivePath}`
    }
    logger.error(errorMessage, { effectivePath })
    throw new Error(`${errorMessage}: ${effectivePath}`)
  }

  return effectivePath
}

import path from 'node:path'

import { logger } from './commons'
import { existsFolder } from './exists-folder'

export function getFolderPath(...pathParts: string[]): string {
  return path.resolve(...pathParts)
}

export async function getFolderPathOrThrow(pathParts: string[], errorMessage?: string): Promise<string> {
  const effectivePath = getFolderPath(...pathParts)

  const exists = await existsFolder(effectivePath)
  if (!exists) {
    if (!errorMessage) {
      errorMessage = `Path does not exist: ${effectivePath}`
    }
    logger.error(errorMessage, { effectivePath })
    throw new Error(`${errorMessage}: ${effectivePath}`)
  }

  return effectivePath
}

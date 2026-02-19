import { Readable } from 'node:stream'

import { getFilePath, getFileStats } from '../file-system'
import { logger } from './commons'
import { getAssistantIconNames } from './get-assistant-icon-names'
import { getAssistantPath } from './get-assistant-path'
import { readAssistantFile } from './read-assistant-file'

export async function readAssistantIcon(
  assistantId: string,
): Promise<{ stream: Readable; size: number; mimeType: string; fileName: string } | null> {
  const fileNames = getAssistantIconNames(assistantId)
  const assistantFolderPath = await getAssistantPath(assistantId)
  // TODO: Find latest icon file not just first match, in case there are multiple icons due to updates without deletes
  const fileNamesExist = await Promise.all(
    fileNames.map(async (name) => ({
      fileName: name,
      stats: await getFileStats(getFilePath(assistantFolderPath, name)),
    })),
  )

  const sortedFiles = fileNamesExist
    .filter(({ stats }) => stats)
    .sort((a, b) => b.stats!.modified.getTime() - a.stats!.modified.getTime())

  if (!sortedFiles.length) {
    logger.warn(`Assistant icon not found`, { assistantId })
    return null
  }

  return await readAssistantFile(assistantId, { fileName: sortedFiles[0].fileName })
}

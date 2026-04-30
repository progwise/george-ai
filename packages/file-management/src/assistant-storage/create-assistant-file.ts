import { WriteStream } from 'node:fs'

import { createFile, getFilePath } from '../file-system'
import { getAssistantPath } from './get-assistant-path'

export async function createAssistantFile(parameters: {
  assistantId: string
  fileName: string
}): Promise<{ writeStream: WriteStream }> {
  const { assistantId, fileName } = parameters
  const assistantPath = await getAssistantPath(assistantId)
  const filePath = getFilePath(assistantPath, fileName)

  return createFile(filePath)
}

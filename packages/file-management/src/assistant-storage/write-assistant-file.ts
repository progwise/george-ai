import { Readable } from 'node:stream'

import { writeFile } from '../file-system'
import { getFilePath } from '../file-system/get-file-path'
import { getAssistantPath } from './get-assistant-path'

export async function writeAssistantFile(
  assistantId: string,
  parameters: { fileName: string; stream: Readable },
): Promise<void> {
  const { fileName, stream } = parameters
  const assistantPath = await getAssistantPath(assistantId)
  const filePath = getFilePath(assistantPath, fileName)

  return await writeFile(filePath, stream)
}

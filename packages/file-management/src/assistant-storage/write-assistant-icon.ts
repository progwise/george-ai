import { Readable } from 'node:stream'

import { ALLOWED_ICON_EXTENSIONS } from './commons'
import { getAssistantIconName } from './get-assistant-icon-name'
import { writeAssistantFile } from './write-assistant-file'

export async function writeAssistantIcon(
  assistantId: string,
  parameters: { filename: string; stream: Readable },
): Promise<void> {
  const extension = parameters.filename.split('.').pop()?.toLowerCase()
  if (!extension || !ALLOWED_ICON_EXTENSIONS.includes(extension)) {
    throw new Error(`Invalid file type. Allowed types are: ${ALLOWED_ICON_EXTENSIONS.join(', ')}`)
  }

  const fileName = getAssistantIconName(assistantId, extension)

  return writeAssistantFile(assistantId, { fileName: fileName, stream: parameters.stream })
}

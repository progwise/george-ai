import { Readable } from 'node:stream'

import { assistant as ass } from '@george-ai/file-management'

export const readAssistantIcon = async (
  assistantId: string,
): Promise<{ stream: Readable; size: number; fileName: string; mimeType: string } | null> => {
  return await ass.readIcon(assistantId)
}

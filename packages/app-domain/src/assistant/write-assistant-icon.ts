import { Readable } from 'node:stream'

import { assistant as ass } from '@george-ai/file-management'

export async function writeAssistantIcon(
  assistantId: string,
  parameters: { filename: string; stream: Readable },
): Promise<void> {
  return ass.writeIcon(assistantId, parameters)
}

import { WriteStream } from 'node:fs'

import { createAssistantIconFile } from '@george-ai/file-management'

export async function createAssistantIcon(assistantId: string, parameters: { mimeType: string }): Promise<WriteStream>
export async function createAssistantIcon(assistantId: string, parameters: { fileName: string }): Promise<WriteStream>
export async function createAssistantIcon(
  assistantId: string,
  parameters: { fileName?: string; mimeType?: string },
): Promise<WriteStream> {
  const { fileName, mimeType } = parameters
  const result = await createAssistantIconFile({ assistantId, fileName, mimeType })
  return result
}

import { WriteStream } from 'node:fs'

import { createFile, getExtensionFromMimeType, getFilePath } from '../file-system'
import { getAssistantIconName } from './get-assistant-icon-name'
import { getAssistantPath } from './get-assistant-path'

export async function createAssistantIconFile(parameters: {
  assistantId: string
  fileName: string
}): Promise<WriteStream>
export async function createAssistantIconFile(parameters: {
  assistantId: string
  mimeType: string
}): Promise<WriteStream>
export async function createAssistantIconFile(parameters: {
  assistantId: string
  fileName?: string
  mimeType?: string
}): Promise<WriteStream>
export async function createAssistantIconFile(parameters: {
  assistantId: string
  fileName?: string
  mimeType?: string
}): Promise<WriteStream> {
  const { assistantId, fileName, mimeType } = parameters

  const fileExtension = fileName ? fileName.split('.').pop() : mimeType ? getExtensionFromMimeType(mimeType) : null
  const assistantPath = await getAssistantPath(assistantId)

  if (!fileExtension) {
    throw new Error(`Cannot read file extension for fileName: ${fileName} or mimeType: ${mimeType}`)
  }
  const iconFileName = getAssistantIconName(assistantId, fileExtension)
  const iconFilePath = getFilePath(assistantPath, iconFileName)

  const result = await createFile(iconFilePath)

  return result.writeStream
}

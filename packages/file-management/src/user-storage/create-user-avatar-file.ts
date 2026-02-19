import { WriteStream } from 'node:fs'

import { createFile, getExtensionFromMimeType, getFilePath } from '../file-system'
import { getUserAvatarName } from './get-user-avatar-name'
import { getUserPath } from './get-user-path'

export async function createUserAvatarFile(parameters: { userId: string; fileName: string }): Promise<WriteStream>
export async function createUserAvatarFile(parameters: { userId: string; mimeType: string }): Promise<WriteStream>
export async function createUserAvatarFile(parameters: {
  userId: string
  fileName?: string
  mimeType?: string
}): Promise<WriteStream>
export async function createUserAvatarFile(parameters: {
  userId: string
  fileName?: string
  mimeType?: string
}): Promise<WriteStream> {
  const { userId, fileName, mimeType } = parameters

  const fileExtension = fileName ? fileName.split('.').pop() : mimeType ? getExtensionFromMimeType(mimeType) : null
  const userPath = await getUserPath(userId)

  if (!fileExtension) {
    throw new Error(`Cannot read file extension for fileName: ${fileName} or mimeType: ${mimeType}`)
  }
  const iconFileName = getUserAvatarName(userId, fileExtension)
  const iconFilePath = getFilePath(userPath, iconFileName)

  const result = await createFile(iconFilePath)

  return result.writeStream
}

import { Readable } from 'node:stream'

import { ALLOWED_AVATAR_EXTENSIONS } from './commons'
import { getUserAvatarName } from './get-user-avatar-name'
import { writeUserFile } from './write-user-file'

export async function writeUserAvatar(
  userId: string,
  parameters: { filename: string; stream: Readable },
): Promise<void> {
  const extension = parameters.filename.split('.').pop()?.toLowerCase()
  if (!extension || !ALLOWED_AVATAR_EXTENSIONS.includes(extension)) {
    throw new Error(`Invalid file type. Allowed types are: ${ALLOWED_AVATAR_EXTENSIONS.join(', ')}`)
  }

  const fileName = getUserAvatarName(userId, extension)

  return writeUserFile(userId, { fileName: fileName, stream: parameters.stream })
}

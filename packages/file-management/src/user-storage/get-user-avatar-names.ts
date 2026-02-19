import { ALLOWED_AVATAR_EXTENSIONS } from './common'
import { getUserAvatarName } from './get-user-avatar-name'

export function getUserAvatarNames(userId: string): string[] {
  const fileNames = ALLOWED_AVATAR_EXTENSIONS.map((extension) => getUserAvatarName(userId, extension))
  return fileNames
}

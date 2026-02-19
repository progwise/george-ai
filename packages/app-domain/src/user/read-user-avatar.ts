import { Readable } from 'node:stream'

import { userStorage as us } from '@george-ai/file-management'

export const readUserAvatar = async (
  userId: string,
): Promise<{ stream: Readable; size: number; fileName: string; mimeType: string } | null> => {
  const avatar = await us.readAvatar(userId)
  return avatar
}

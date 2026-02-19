export function getUserAvatarName(userId: string, extension: string): string {
  return `${userId}-avatar.${extension}`
}

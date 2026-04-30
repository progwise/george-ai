import { extractAvatarFromToken, isProviderAvatar } from './avatar'
import { checkUser } from './check-user'
import { createUser } from './create-user'
import { createUserAvatar } from './create-user-avatar'
import { deleteUser } from './delete-user'
import { deleteUserAvatar } from './delete-user-avatar'
import { getUser } from './get-user'
import { getUserProfile } from './get-user-profile'
import { getWorkspaceMembership } from './get-workspace-membership'
import { readUserAvatar } from './read-user-avatar'
import type { User } from './user'

export {
  checkUser,
  getUser,
  getUserProfile,
  createUser,
  readUserAvatar,
  createUserAvatar,
  isProviderAvatar,
  getWorkspaceMembership,
  extractAvatarFromToken,
  deleteUser,
  deleteUserAvatar,
}

export type { User }
export default {
  getUser,
  getUserProfile,
  getWorkspaceMembership,
  createUser,
  checkUser,
  readUserAvatar,
  createUserAvatar,
  isProviderAvatar,
  extractAvatarFromToken,
  deleteUser,
  deleteUserAvatar,
}

export interface User {
  userId: string
  email: string
  name: string | null
  username: string
  avatarUrl: string | null
  hasProfile: boolean
  defaultWorkspaceId: string
  isAdmin: boolean
}

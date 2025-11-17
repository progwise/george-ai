import { User, UserProfile } from '../../prisma/generated/client'

type AuthUser = Partial<Omit<User, 'id' | 'email' | 'username'>> & {
  id: string
  email: string
  username: string
}

interface ApiKeyAuth {
  userId: string
  libraryId: string
  apiKeyId: string
}

export interface Context {
  session: { user: AuthUser; userProfile?: UserProfile } | null
  apiKey?: ApiKeyAuth
  jwt?: string
  workspaceId?: string
  workspaceRole?: string
}

export interface LoggedInContext extends Context {
  session: { user: AuthUser; userProfile?: UserProfile; jwt: string }
  workspaceId: string
  workspaceRole: string
}

export interface ApiKeyContext extends Context {
  apiKey: ApiKeyAuth
  workspaceId: string
}

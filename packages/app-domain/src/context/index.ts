import { User, UserProfile } from '@george-ai/app-database'

export type AuthUser = Partial<Omit<User, 'id' | 'email' | 'username'>> & {
  id: string
  email: string
  username: string
}

export interface ApiKeyAuth {
  userId: string
  workspaceId: string
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
  session: { user: AuthUser; userProfile?: UserProfile }
  jwt: string
  workspaceId: string
  workspaceRole: string
}

export interface ApiKeyContext extends Context {
  apiKey: ApiKeyAuth
  workspaceId: string
}

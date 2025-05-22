import { User, UserProfile } from '@george-ai/prismaClient'

type AuthUser = Partial<Omit<User, 'id' | 'email' | 'username'>> & {
  id: string
  email: string
  username: string
}

export interface Context {
  session: { user: AuthUser; userProfile?: UserProfile; jwt: string } | null
}

export interface LoggedInContext extends Context {
  session: { user: AuthUser; userProfile?: UserProfile; jwt: string }
}

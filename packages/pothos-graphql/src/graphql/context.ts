import { User } from '@george-ai/prismaClient'

type AuthUser = Partial<Omit<User, 'id' | 'email' | 'username'>> & {
  id: string
  email: string
  username: string
}

export interface Context {
  session: { user: AuthUser; jwt: string } | null
}

export interface LoggedInContext extends Context {
  session: { user: AuthUser; jwt: string }
}

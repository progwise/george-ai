import { PrismaClient } from '@george-ai/prismaClient'
import type { User as PrismaUser, UserProfile as PrismaUserProfile } from '@george-ai/prismaClient'

import { decodeToken } from './auth'

export type AuthUser = Partial<Omit<PrismaUser, 'emailVerified'>> & { id: string }

export interface GraphQLContext {
  prisma: PrismaClient
  user: AuthUser | null
  userProfile: PrismaUserProfile | null
}

export interface LoggedInContext extends GraphQLContext {
  user: AuthUser
  userProfile: PrismaUserProfile | null
}

const prisma = new PrismaClient()

export async function createContext(req: Request): Promise<GraphQLContext> {
  const authHeader = req.headers.get('authorization')
  let user: AuthUser | null = null
  let userProfile: PrismaUserProfile | null = null

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '')
    try {
      const decoded = await decodeToken(token)
      user = {
        id: decoded.sub,
        email: decoded.email,
      }

      userProfile = await prisma.userProfile.findFirst({
        where: { userId: decoded.sub },
      })
    } catch (error) {
      console.error('Error decoding token:', error)
    }
  }
  return { prisma, user, userProfile }
}

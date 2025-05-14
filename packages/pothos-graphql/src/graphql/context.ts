import { PrismaClient } from '@george-ai/prismaClient'
import type { User as PrismaUser } from '@george-ai/prismaClient'

import { decodeToken } from './auth'

export type AuthUser = Partial<Omit<PrismaUser, 'emailVerified'>> & { id: string }

export interface GraphQLContext {
  prisma: PrismaClient
  user: AuthUser | null
}

export interface LoggedInContext extends GraphQLContext {
  user: AuthUser
}

const prisma = new PrismaClient()

export async function createContext(req: Request): Promise<GraphQLContext> {
  const authHeader = req.headers.get('authorization')
  let user: AuthUser | null = null

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '')
    try {
      const decoded = await decodeToken(token)
      user = {
        id: decoded.sub,
        email: decoded.email,
      }
    } catch (error) {
      console.error('Error decoding token:', error)
    }
  }
  return { prisma, user }
}

import { PrismaClient } from '../prisma/generated/client'
import { IS_PRODUCTION } from './global-config'

// from https://www.prisma.io/docs/support/help-articles/nextjs-prisma-client-dev-practices
declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = global.prisma ?? new PrismaClient()

if (!IS_PRODUCTION) {
  global.prisma = prisma
}

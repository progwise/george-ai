import { createLogger } from '@george-ai/web-utils'

import { Prisma, PrismaClient } from '../prisma/generated/client'
import { IS_PRODUCTION, LOG_LEVEL } from './global-config'

const logger = createLogger('Prisma')

// from https://www.prisma.io/docs/support/help-articles/nextjs-prisma-client-dev-practices
declare global {
  var prisma: PrismaClient | undefined
}

// Configure Prisma logging based on LOG_LEVEL
// DEBUG: query, info, warn, error
// INFO: info, warn, error
// WARN: warn, error
// ERROR: error only
const getLogLevels = (): Prisma.LogLevel[] => {
  switch (LOG_LEVEL) {
    case 'DEBUG':
      return ['query', 'info', 'warn', 'error']
    case 'INFO':
      return ['info', 'warn', 'error']
    case 'WARN':
      return ['warn', 'error']
    case 'ERROR':
    default:
      return ['error']
  }
}

const createPrismaClient = () => {
  const client = new PrismaClient({
    log: getLogLevels().map((level) => ({
      emit: 'event',
      level,
    })),
  })

  // Forward Prisma logs to our structured logger
  client.$on('query', (e) => {
    logger.debug(`Query: ${e.query} - Duration: ${e.duration}ms`)
  })

  client.$on('info', (e) => {
    logger.info(e.message)
  })

  client.$on('warn', (e) => {
    logger.warn(e.message)
  })

  client.$on('error', (e) => {
    logger.error(e.message)
  })

  return client
}

export const prisma = global.prisma ?? createPrismaClient()

if (!IS_PRODUCTION) {
  global.prisma = prisma
}

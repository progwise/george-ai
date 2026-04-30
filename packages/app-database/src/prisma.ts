import { PrismaPg } from '@prisma/adapter-pg'

import { createLogger, getConfigValue } from '@george-ai/app-commons'

import { Prisma, PrismaClient } from '../prisma/generated/client'

const logger = createLogger('Prisma')

const getLogLevels = (): Prisma.LogLevel[] => {
  switch (getConfigValue('LOG_LEVEL')) {
    case 'DEBUG':
      return ['info', 'warn', 'error']
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
  const connectionString: string = getConfigValue('DATABASE_URL')

  // Create Prisma adapter for PostgreSQL
  const adapter = new PrismaPg({ connectionString })

  const client = new PrismaClient({
    adapter,
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

export const prisma = createPrismaClient()

import { execSync } from 'node:child_process'
import { resolve } from 'node:path'
import { Client } from 'pg'

import conf from '../config'
import { logger } from './common'

const TEST_DB_CONFIG = {
  host: conf('TEST_DB_HOST'),
  port: conf('TEST_DB_PORT'),
  user: conf('TEST_DB_USER'),
  password: conf('TEST_DB_PASSWORD'),
}

const getTestDatabaseUrl = (databaseName: string) => {
  return `postgresql://${TEST_DB_CONFIG.user}:${TEST_DB_CONFIG.password}@${TEST_DB_CONFIG.host}:${TEST_DB_CONFIG.port}/${databaseName}?schema=public`
}

const ensureTestDatabase = async (databaseName: string) => {
  const dbUrl = getTestDatabaseUrl(databaseName)
  const adminClient = new Client({
    ...TEST_DB_CONFIG,
    database: 'postgres', // Connect to default database for admin operations
  })
  process.env.DATABASE_URL = dbUrl

  logger.info('Setting up test database ...', { databaseName, dbUrl, TEST_DB_CONFIG })

  try {
    await adminClient.connect()

    await adminClient.query(`CREATE DATABASE "${databaseName}"`).catch((error) => {
      const errorMessage = error instanceof Error ? error.message : 'Error creating Test Database'

      if (errorMessage.includes('already exists')) {
        logger.info('Test database already existed', { databaseName, TEST_DB_CONFIG })
      } else {
        throw error
      }
    })

    logger.info(`✅ Created database`, { databaseName, TEST_DB_CONFIG })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error creating Test Database'

    if (errorMessage.includes('already exists')) {
      logger.info('Test database already existed', { databaseName, TEST_DB_CONFIG })
    } else {
      logger.error('Error creating test database', { databaseName, error, TEST_DB_CONFIG })
    }
  } finally {
    await adminClient.end()
  }

  // Run prisma from app-database package (where Prisma CLI is installed)
  const appDatabasePath = resolve(__dirname, '../..')
  try {
    logger.info('Pushing Prisma schema to test database...', { databaseName, appDatabasePath })
    execSync('pnpm prisma db push --accept-data-loss', {
      stdio: 'inherit',
      cwd: appDatabasePath,
      env: { ...process.env, DATABASE_URL: dbUrl },
    })
    logger.info('✅ Prisma schema pushed to test database')
  } catch (error) {
    logger.error('Error pushing Prisma schema to test database', { error, databaseName, TEST_DB_CONFIG })
    // If interrupted by SIGINT from another failing test, the schema is likely already pushed
    // Check if it was SIGINT and warn instead of failing
    const isSignalError =
      error &&
      typeof error === 'object' &&
      ('signal' in error || 'status' in error) &&
      ((error as { signal?: string }).signal === 'SIGINT' || (error as { status?: number | null }).status === null)

    if (isSignalError) {
      logger.warn('⚠️  Prisma db push was interrupted, but database may already be set up', {
        databaseName,
        TEST_DB_CONFIG,
      })
    } else {
      throw error
    }
  }

  logger.info('✅ Test database ready', { databaseName, TEST_DB_CONFIG })
}

const dropTestDatabase = async (databaseName: string) => {
  const adminClient = new Client({
    ...TEST_DB_CONFIG,
    database: 'postgres', // Connect to default database for admin operations
  })
  try {
    logger.info('Dropping test database ...', { databaseName, TEST_DB_CONFIG })
    await adminClient.connect()

    // Connect to default 'postgres' database to create test database

    await adminClient.query(`DROP DATABASE IF EXISTS "${databaseName}" WITH (FORCE)`)
    logger.info('✅ Dropped database', { databaseName, TEST_DB_CONFIG })
  } catch (error) {
    logger.error('Error dropping test database', { databaseName, error, TEST_DB_CONFIG })
  } finally {
    await adminClient.end()
  }
}

export { getTestDatabaseUrl, ensureTestDatabase, dropTestDatabase }

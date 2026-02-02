import { execSync } from 'node:child_process'
import { resolve } from 'node:path'
import { Client } from 'pg'

// Test database configuration - single source of truth
// Defaults for devcontainer, can be overridden via environment variables
const TEST_DB_CONFIG = {
  host: process.env.TEST_DB_HOST || 'gai-chatweb-db-test',
  port: parseInt(process.env.TEST_DB_PORT || '5432'),
  user: process.env.TEST_DB_USER || 'chatweb-test',
  password: process.env.TEST_DB_PASSWORD || 'password',
  database: 'pothos-graphql-test', // Package-specific database name
}

const TEST_DB_URL = `postgresql://${TEST_DB_CONFIG.user}:${TEST_DB_CONFIG.password}@${TEST_DB_CONFIG.host}:${TEST_DB_CONFIG.port}/${TEST_DB_CONFIG.database}?schema=public`

const ensureTestDatabase = async () => {
  // Connect to default 'postgres' database to create test database
  const adminClient = new Client({
    ...TEST_DB_CONFIG,
    database: 'postgres', // Connect to default database for admin operations
  })
  process.env.DATABASE_URL = TEST_DB_URL

  console.log('Setting up test database ...')

  try {
    await adminClient.connect()

    await adminClient.query(`CREATE DATABASE "${TEST_DB_CONFIG.database}"`).catch((error) => {
      const errorMessage = error instanceof Error ? error.message : 'Error creating Test Database'

      if (errorMessage.includes('already exists')) {
        console.log('Test database already existed')
      } else {
        throw error
      }
    })

    console.log(`✅ Created ${TEST_DB_CONFIG.database} database`)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error creating Test Database'

    if (errorMessage.includes('already exists')) {
      console.log('Test database already existed')
    } else {
      console.error('Error creating test database', error)
    }
  } finally {
    await adminClient.end()
  }

  // Run prisma from app-domain package (where Prisma CLI is installed)
  const appDomainPath = resolve(__dirname, '../..')

  try {
    console.log('Pushing Prisma schema to test database...')
    execSync('pnpm prisma db push --accept-data-loss', {
      stdio: 'inherit',
      cwd: appDomainPath,
      env: { ...process.env, DATABASE_URL: TEST_DB_URL },
    })
    console.log('✅ Prisma schema pushed to test database')
  } catch (error) {
    console.error('Error pushing Prisma schema to test database', error)
    // If interrupted by SIGINT from another failing test, the schema is likely already pushed
    // Check if it was SIGINT and warn instead of failing
    const isSignalError =
      error &&
      typeof error === 'object' &&
      ('signal' in error || 'status' in error) &&
      ((error as { signal?: string }).signal === 'SIGINT' || (error as { status?: number | null }).status === null)

    if (isSignalError) {
      console.warn('⚠️  Prisma db push was interrupted, but database may already be set up')
    } else {
      throw error
    }
  }

  console.log('✅ Test database ready')
}

const dropTestDatabase = async () => {
  const adminClient = new Client({
    ...TEST_DB_CONFIG,
    database: 'postgres', // Connect to default database for admin operations
  })
  try {
    console.log('Dropping test database ...')
    await adminClient.connect()

    // Connect to default 'postgres' database to create test database

    await adminClient.query(`DROP DATABASE IF EXISTS "${TEST_DB_CONFIG.database}"`)
    console.log(`✅ Dropped ${TEST_DB_CONFIG.database} database`)
  } catch (error) {
    console.error('Error dropping test database', error)
  } finally {
    await adminClient.end()
  }
}

export { TEST_DB_CONFIG, TEST_DB_URL, ensureTestDatabase, dropTestDatabase }

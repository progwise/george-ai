import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { Client } from 'pg'

import { PrismaClient } from '../../prisma/generated/client'

// Simple file-based lock to prevent concurrent prisma operations
// Use /tmp for cross-package lock directory (works regardless of cwd)
const LOCK_DIR = '/tmp/george-ai-test-locks'

// Simple sleep that won't be interrupted by signals
const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

// Check if a process is still running
const isProcessRunning = (pid: number): boolean => {
  try {
    // Signal 0 checks if process exists without actually sending a signal
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

const acquireLock = async (lockName: string, timeoutMs = 30000): Promise<() => void> => {
  const lockFile = join(LOCK_DIR, lockName)
  const startTime = Date.now()

  // Create lock directory if it doesn't exist
  if (!existsSync(LOCK_DIR)) {
    mkdirSync(LOCK_DIR, { recursive: true })
  }

  // Wait for lock to be available
  while (existsSync(lockFile)) {
    // Check if lock is stale (process no longer running)
    try {
      const lockPid = parseInt(readFileSync(lockFile, 'utf-8'))
      if (!isProcessRunning(lockPid)) {
        console.log(`Removing stale lock for PID ${lockPid}`)
        rmSync(lockFile, { force: true })
        break
      }
    } catch {
      // If we can't read the lock file, try to remove it
      rmSync(lockFile, { force: true })
      break
    }

    if (Date.now() - startTime > timeoutMs) {
      throw new Error(`Failed to acquire lock ${lockName} after ${timeoutMs}ms`)
    }
    // Sleep for 100ms (won't be interrupted by SIGINT)
    await sleep(100)
  }

  // Acquire lock
  writeFileSync(lockFile, process.pid.toString())

  // Return release function
  return () => {
    try {
      rmSync(lockFile, { force: true })
    } catch {
      // Ignore errors on release
    }
  }
}

// Test database configuration - single source of truth
// Defaults for devcontainer, can be overridden via environment variables
const TEST_DB_CONFIG = {
  host: process.env.TEST_DB_HOST || 'gai-chatweb-db-test',
  port: parseInt(process.env.TEST_DB_PORT || '5432'),
  user: process.env.TEST_DB_USER || 'chatweb-test',
  password: process.env.TEST_DB_PASSWORD || 'password',
  database: 'app-domain-test', // Package-specific database name
}

const TEST_DB_URL = `postgresql://${TEST_DB_CONFIG.user}:${TEST_DB_CONFIG.password}@${TEST_DB_CONFIG.host}:${TEST_DB_CONFIG.port}/${TEST_DB_CONFIG.database}?schema=public`

export default async () => {
  process.env.DATABASE_URL = TEST_DB_URL

  console.log('Setting up test database for app-domain...')

  // Connect to default 'postgres' database to create test database
  const adminClient = new Client({
    ...TEST_DB_CONFIG,
    database: 'postgres', // Connect to default database for admin operations
  })

  try {
    await adminClient.connect()

    // Drop and recreate database for clean state
    await adminClient.query(`DROP DATABASE IF EXISTS "${TEST_DB_CONFIG.database}"`)
    await adminClient.query(`CREATE DATABASE "${TEST_DB_CONFIG.database}"`)

    console.log(`✅ Created ${TEST_DB_CONFIG.database} database`)
  } catch (error) {
    console.error('Error creating database:', error)
    throw error
  } finally {
    await adminClient.end()
  }

  // Push schema to test database (with lock to prevent concurrent operations)
  const releaseLock = await acquireLock('prisma-db-push')
  try {
    execSync('pnpm prisma db push --accept-data-loss', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: TEST_DB_URL },
    })
  } catch (error) {
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
  } finally {
    releaseLock()
  }

  console.log('✅ Test database ready')

  // Return teardown function
  return async () => {
    console.log('Cleaning up test database...')

    // Create PostgreSQL connection pool for test database
    const { Pool } = await import('pg')
    const { PrismaPg } = await import('@prisma/adapter-pg')

    const pool = new Pool({
      connectionString: TEST_DB_URL,
    })

    const adapter = new PrismaPg(pool)

    const prisma = new PrismaClient({ adapter })

    try {
      // Clean up all test data
      // Delete in order to respect foreign key constraints
      await prisma.aiModelUsage.deleteMany()
      await prisma.workspaceMember.deleteMany()
      await prisma.workspaceInvitation.deleteMany()
      await prisma.user.deleteMany() // Delete users before workspaces (FK: User.defaultWorkspaceId)
      await prisma.workspace.deleteMany()

      console.log('✅ Test database cleaned')
    } catch (error) {
      console.error('Error cleaning test database:', error)
    } finally {
      await prisma.$disconnect()
    }
  }
}

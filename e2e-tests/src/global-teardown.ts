import { Client } from 'pg'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required for E2E tests')
}

async function globalTeardown() {
  console.log('🧹 E2E Global Teardown: Cleaning up test workspaces...')

  const client = new Client({ connectionString: DATABASE_URL })

  try {
    await client.connect()
    console.log('  ✅ Database connected')

    // Delete workspaces created during tests (but NOT the permanent E2E Test Workspace 1 and 2)
    const result = await client.query(
      `
      DELETE FROM "Workspace"
      WHERE (
        name LIKE 'Test Workspace%'
        OR name LIKE 'Test Auto Slug%'
        OR name LIKE 'Delete Test WS%'
        OR name LIKE 'Empty WS%'
        OR name LIKE 'Auto Switch%'
      )
      AND id NOT IN (
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000003'
      )
      RETURNING name
    `,
    )

    if (result.rows.length > 0) {
      console.log(`  ✅ Deleted ${result.rows.length} test workspaces:`)
      result.rows.forEach((row) => console.log(`     - ${row.name}`))
    } else {
      console.log('  ✅ No test workspaces to clean up')
    }

    console.log('✅ E2E Global Teardown completed')
  } catch (error) {
    console.error('❌ E2E Global Teardown failed:')
    console.error(error)
    // Don't throw - we don't want cleanup failures to fail the test run
  } finally {
    try {
      await client.end()
    } catch (error) {
      console.error('Failed to close database connection:', error)
    }
  }
}

export default globalTeardown

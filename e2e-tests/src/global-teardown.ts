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

    // Delete test automation items first (foreign key constraint)
    await client.query(
      `
      DELETE FROM "AiAutomationItem"
      WHERE "automationId" IN (
        SELECT id FROM "AiAutomation"
        WHERE name LIKE 'E2E Test%'
      )
    `,
    )

    // Delete test automation batches
    await client.query(
      `
      DELETE FROM "AiAutomationBatch"
      WHERE "automationId" IN (
        SELECT id FROM "AiAutomation"
        WHERE name LIKE 'E2E Test%'
      )
    `,
    )

    // Delete test automations
    const automationResult = await client.query(
      `
      DELETE FROM "AiAutomation"
      WHERE name LIKE 'E2E Test%'
      RETURNING name
    `,
    )

    if (automationResult.rows.length > 0) {
      console.log(`  ✅ Deleted ${automationResult.rows.length} test automations:`)
      automationResult.rows.forEach((row) => console.log(`     - ${row.name}`))
    } else {
      console.log('  ✅ No test automations to clean up')
    }

    // Delete test connectors
    const connectorResult = await client.query(
      `
      DELETE FROM "AiConnector"
      WHERE name LIKE 'E2E Test%'
      RETURNING name
    `,
    )

    if (connectorResult.rows.length > 0) {
      console.log(`  ✅ Deleted ${connectorResult.rows.length} test connectors:`)
      connectorResult.rows.forEach((row) => console.log(`     - ${row.name}`))
    } else {
      console.log('  ✅ No test connectors to clean up')
    }

    // Delete test list items first (foreign key constraint)
    await client.query(
      `
      DELETE FROM "AiListItem"
      WHERE "listId" IN (
        SELECT id FROM "AiList"
        WHERE name LIKE 'E2E Test List%'
      )
    `,
    )

    // Delete test list sources (foreign key constraint)
    await client.query(
      `
      DELETE FROM "AiListSource"
      WHERE "listId" IN (
        SELECT id FROM "AiList"
        WHERE name LIKE 'E2E Test List%'
      )
    `,
    )

    // Delete test lists created during tests (CASCADE will delete fields, context sources, etc.)
    const listResult = await client.query(
      `
      DELETE FROM "AiList"
      WHERE name LIKE 'E2E Test List%'
      RETURNING name
    `,
    )

    if (listResult.rows.length > 0) {
      console.log(`  ✅ Deleted ${listResult.rows.length} test lists:`)
      listResult.rows.forEach((row) => console.log(`     - ${row.name}`))
    } else {
      console.log('  ✅ No test lists to clean up')
    }

    // Delete library files first (foreign key constraint)
    await client.query(
      `
      DELETE FROM "AiLibraryFile"
      WHERE "libraryId" IN (
        SELECT id FROM "AiLibrary"
        WHERE "workspaceId" IN (
          '00000000-0000-0000-0000-000000000002',
          '00000000-0000-0000-0000-000000000003'
        )
      )
    `,
    )

    // Delete ALL libraries in test workspaces
    // These are recreated fresh in global-setup.ts, so safe to delete everything
    const libraryResult = await client.query(
      `
      DELETE FROM "AiLibrary"
      WHERE "workspaceId" IN (
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000003'
      )
      RETURNING name
    `,
    )

    if (libraryResult.rows.length > 0) {
      console.log(`  ✅ Deleted ${libraryResult.rows.length} test libraries:`)
      libraryResult.rows.forEach((row) => console.log(`     - ${row.name}`))
    } else {
      console.log('  ✅ No test libraries to clean up')
    }

    // Delete workspaces created during tests (but NOT the permanent E2E Test Workspace 1 and 2)
    const wsResult = await client.query(
      `
      DELETE FROM "Workspace"
      WHERE (
        name LIKE 'Test Workspace%'
        OR name LIKE 'Test Auto Slug%'
        OR name LIKE 'Delete Test WS%'
        OR name LIKE 'Empty WS%'
        OR name LIKE 'Auto Switch%'
        OR name LIKE 'E2E Test Workspace%'
      )
      AND id NOT IN (
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000003'
      )
      RETURNING name
    `,
    )

    if (wsResult.rows.length > 0) {
      console.log(`  ✅ Deleted ${wsResult.rows.length} test workspaces:`)
      wsResult.rows.forEach((row) => console.log(`     - ${row.name}`))
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

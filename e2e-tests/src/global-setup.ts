import { Client } from 'pg'

const E2E_USERNAME = process.env.E2E_USERNAME!
const E2E_EMAIL = process.env.E2E_EMAIL!
const DATABASE_URL = process.env.DATABASE_URL
const SHARED_WORKSPACE_ID = '00000000-0000-0000-0000-000000000001'

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required for E2E tests')
}

async function globalSetup() {
  console.log('🔧 E2E Global Setup: Creating test user and workspaces...')

  const client = new Client({ connectionString: DATABASE_URL })
  await client.connect()

  try {
    // Step 1: Ensure E2E test user exists (upsert)
    const userResult = await client.query(
      `
      INSERT INTO "User" (id, email, username, "defaultWorkspaceId", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())
      ON CONFLICT (email)
      DO UPDATE SET username = $2, "updatedAt" = NOW()
      RETURNING id
    `,
      [E2E_EMAIL, E2E_USERNAME, SHARED_WORKSPACE_ID],
    )

    const userId = userResult.rows[0].id
    console.log(`  ✅ E2E user ready: ${E2E_EMAIL}`)

    // Create test workspaces
    const testWorkspaces = [
      {
        id: '00000000-0000-0000-0000-000000000002',
        name: 'E2E Test Workspace 1',
        slug: 'e2e-test-workspace-1',
      },
      {
        id: '00000000-0000-0000-0000-000000000003',
        name: 'E2E Test Workspace 2',
        slug: 'e2e-test-workspace-2',
      },
    ]

    for (const workspace of testWorkspaces) {
      // Upsert workspace
      await client.query(
        `
        INSERT INTO "Workspace" (id, name, slug, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, NOW(), NOW())
        ON CONFLICT (id)
        DO UPDATE SET name = $2, slug = $3, "updatedAt" = NOW()
      `,
        [workspace.id, workspace.name, workspace.slug],
      )

      // Add user as admin
      const memberResult = await client.query(
        'SELECT id FROM "WorkspaceMember" WHERE "workspaceId" = $1 AND "userId" = $2',
        [workspace.id, userId],
      )

      if (memberResult.rows.length === 0) {
        await client.query(
          `
          INSERT INTO "WorkspaceMember" (id, "workspaceId", "userId", role, "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), $1, $2, 'ADMIN', NOW(), NOW())
        `,
          [workspace.id, userId],
        )
        console.log(`  ✅ Created workspace: ${workspace.name}`)
      } else {
        console.log(`  ℹ️  Workspace exists: ${workspace.name}`)
      }
    }

    console.log('✅ E2E Global Setup completed')
  } finally {
    await client.end()
  }
}

export default globalSetup

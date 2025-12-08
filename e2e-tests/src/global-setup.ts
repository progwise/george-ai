import { Client } from 'pg'

const E2E_USERNAME = process.env.E2E_USERNAME!
const E2E_EMAIL = process.env.E2E_EMAIL!
const DATABASE_URL = process.env.DATABASE_URL
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL
const OLLAMA_VRAM_GB = process.env.OLLAMA_VRAM_GB ? parseInt(process.env.OLLAMA_VRAM_GB) : 16
const SHARED_WORKSPACE_ID = '00000000-0000-0000-0000-000000000001'

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required for E2E tests')
}

async function globalSetup() {
  console.log('🔧 E2E Global Setup: Creating test user and workspaces...')

  const client = new Client({ connectionString: DATABASE_URL })

  try {
    await client.connect()
    console.log('  ✅ Database connected')
    // Step 1: Ensure E2E test user exists (upsert) with admin privileges
    const userResult = await client.query(
      `
      INSERT INTO "User" (id, email, username, "isAdmin", "defaultWorkspaceId", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), $1, $2, true, $3, NOW(), NOW())
      ON CONFLICT (email)
      DO UPDATE SET username = $2, "isAdmin" = true, "updatedAt" = NOW(), "defaultWorkspaceId" = $3
      RETURNING id
    `,
      [E2E_EMAIL, E2E_USERNAME, SHARED_WORKSPACE_ID],
    )

    const userId = userResult.rows[0].id
    console.log(`  ✅ E2E user ready: ${E2E_EMAIL}`)

    // Ensure user is a member of the Shared workspace (their default)
    const sharedMemberResult = await client.query(
      'SELECT id FROM "WorkspaceMember" WHERE "workspaceId" = $1 AND "userId" = $2',
      [SHARED_WORKSPACE_ID, userId],
    )

    if (sharedMemberResult.rows.length === 0) {
      await client.query(
        `
        INSERT INTO "WorkspaceMember" (id, "workspaceId", "userId", role, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), $1, $2, 'owner', NOW(), NOW())
      `,
        [SHARED_WORKSPACE_ID, userId],
      )
      console.log(`  ✅ Added user to Shared workspace`)
    } else {
      console.log(`  ℹ️  User already member of Shared workspace`)
    }

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
          VALUES (gen_random_uuid(), $1, $2, 'owner', NOW(), NOW())
        `,
          [workspace.id, userId],
        )
        console.log(`  ✅ Created workspace: ${workspace.name}`)
      } else {
        console.log(`  ℹ️  Workspace exists: ${workspace.name}`)
      }
    }

    // Step 3: Create AI Service Providers for test workspaces
    if (OPENAI_API_KEY && OPENAI_API_KEY.length > 0) {
      // Create OpenAI provider in Workspace 1
      const workspace1Id = '00000000-0000-0000-0000-000000000002'
      await client.query(
        `
        INSERT INTO "AiServiceProvider" (id, "workspaceId", provider, name, enabled, "baseUrl", "apiKey", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), $1, 'openai', 'OpenAI (E2E)', true, 'https://api.openai.com/v1', $2, NOW(), NOW())
        ON CONFLICT ("workspaceId", provider, name)
        DO UPDATE SET "apiKey" = $2, enabled = true, "updatedAt" = NOW()
      `,
        [workspace1Id, OPENAI_API_KEY],
      )
      console.log(`  ✅ Configured OpenAI provider for E2E Test Workspace 1`)
    } else {
      console.log(`  ⚠️  OPENAI_API_KEY not set, skipping OpenAI provider setup`)
    }

    if (OLLAMA_BASE_URL && OLLAMA_BASE_URL.length > 0) {
      // Create Ollama provider in Workspace 2
      const workspace2Id = '00000000-0000-0000-0000-000000000003'
      await client.query(
        `
        INSERT INTO "AiServiceProvider" (id, "workspaceId", provider, name, enabled, "baseUrl", "vramGb", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), $1, 'ollama', 'Ollama (E2E)', true, $2, $3, NOW(), NOW())
        ON CONFLICT ("workspaceId", provider, name)
        DO UPDATE SET "baseUrl" = $2, "vramGb" = $3, enabled = true, "updatedAt" = NOW()
      `,
        [workspace2Id, OLLAMA_BASE_URL, OLLAMA_VRAM_GB],
      )
      console.log(`  ✅ Configured Ollama provider for E2E Test Workspace 2`)
    } else {
      console.log(`  ⚠️  OLLAMA_BASE_URL not set, skipping Ollama provider setup`)
    }

    // Step 4: Discover and sync models from providers
    console.log('  🔍 Discovering models from configured providers...')

    // Discover OpenAI models
    if (OPENAI_API_KEY && OPENAI_API_KEY.length > 0) {
      try {
        console.log('  🔍 Discovering OpenAI models...')
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
        })

        if (!response.ok) {
          throw new Error(`OpenAI API returned ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()

        if (data.data) {
          for (const model of data.data) {
            const modelId = model.id

            // Determine capabilities based on model name
            const canDoEmbedding = modelId.includes('embedding')
            const canDoChatCompletion = modelId.includes('gpt') || modelId.includes('chat')
            const canDoVision = modelId.includes('gpt-4') && modelId.includes('vision')
            const canDoFunctionCalling = modelId.includes('gpt-4') || modelId.includes('gpt-3.5')

            // Insert model into database
            await client.query(
              `
              INSERT INTO "AiLanguageModel" (
                id, name, provider, "canDoEmbedding", "canDoChatCompletion",
                "canDoVision", "canDoFunctionCalling", enabled, "createdAt", "updatedAt"
              )
              VALUES (
                gen_random_uuid(), $1, 'openai', $2, $3, $4, $5, true, NOW(), NOW()
              )
              ON CONFLICT (provider, name)
              DO UPDATE SET
                "canDoEmbedding" = $2,
                "canDoChatCompletion" = $3,
                "canDoVision" = $4,
                "canDoFunctionCalling" = $5,
                enabled = true,
                "updatedAt" = NOW()
            `,
              [modelId, canDoEmbedding, canDoChatCompletion, canDoVision, canDoFunctionCalling],
            )
          }
          console.log(`  ✅ Synced ${data.data.length} OpenAI models`)
        }
      } catch (error) {
        console.log(`  ⚠️  Failed to discover OpenAI models:`, error)
      }
    }

    // Discover Ollama models
    if (OLLAMA_BASE_URL && OLLAMA_BASE_URL.length > 0) {
      try {
        console.log('  🔍 Discovering Ollama models...')
        const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`)

        if (!response.ok) {
          throw new Error(`Ollama API returned ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()

        if (data.models) {
          for (const model of data.models) {
            const modelName = model.name

            // Determine capabilities based on model name
            const canDoEmbedding = modelName.includes('embed') || modelName.includes('nomic')
            const canDoChatCompletion = !canDoEmbedding
            const canDoVision =
              modelName.includes('vision') || modelName.includes('llava') || modelName.includes('bakllava')
            const canDoFunctionCalling = modelName.includes('llama3') || modelName.includes('mistral')

            // Insert model into database
            await client.query(
              `
              INSERT INTO "AiLanguageModel" (
                id, name, provider, "canDoEmbedding", "canDoChatCompletion",
                "canDoVision", "canDoFunctionCalling", enabled, "createdAt", "updatedAt"
              )
              VALUES (
                gen_random_uuid(), $1, 'ollama', $2, $3, $4, $5, true, NOW(), NOW()
              )
              ON CONFLICT (provider, name)
              DO UPDATE SET
                "canDoEmbedding" = $2,
                "canDoChatCompletion" = $3,
                "canDoVision" = $4,
                "canDoFunctionCalling" = $5,
                enabled = true,
                "updatedAt" = NOW()
            `,
              [modelName, canDoEmbedding, canDoChatCompletion, canDoVision, canDoFunctionCalling],
            )
          }
          console.log(`  ✅ Synced ${data.models.length} Ollama models`)
        }
      } catch (error) {
        console.log(`  ⚠️  Failed to discover Ollama models:`, error)
      }
    }

    // Step 5: Create test data in BOTH workspaces for workspace switching tests
    console.log('  📚 Creating test data in both workspaces...')
    const workspace1Id = '00000000-0000-0000-0000-000000000002'
    const workspace2Id = '00000000-0000-0000-0000-000000000003'

    // Helper function to create test data for a workspace
    const createWorkspaceTestData = async (workspaceId: string, workspaceNum: number, ownerId: string) => {
      const librarySuffix = workspaceNum === 1 ? ' - Field Modal' : ` - WS${workspaceNum}`
      const listSuffix = workspaceNum === 1 ? ' - Field Modal' : ` - WS${workspaceNum}`

      // Create the test library
      const libraryResult = await client.query(
        `
        INSERT INTO "AiLibrary" (id, "workspaceId", "ownerId", name, description, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())
        ON CONFLICT DO NOTHING
        RETURNING id
      `,
        [
          workspaceId,
          ownerId,
          `E2E Test Library${librarySuffix}`,
          `Test library for E2E tests in workspace ${workspaceNum}`,
        ],
      )

      let libraryId: string
      if (libraryResult.rows.length > 0) {
        libraryId = libraryResult.rows[0].id
        console.log(`  ✅ Created test library: E2E Test Library${librarySuffix}`)
      } else {
        const existingLibrary = await client.query(
          'SELECT id FROM "AiLibrary" WHERE name = $1 AND "workspaceId" = $2',
          [`E2E Test Library${librarySuffix}`, workspaceId],
        )
        libraryId = existingLibrary.rows[0].id
        console.log(`  ℹ️  Test library already exists: E2E Test Library${librarySuffix}`)
      }

      // Delete existing files in the library (clean slate)
      await client.query(`DELETE FROM "AiLibraryFile" WHERE "libraryId" = $1`, [libraryId])

      // Add sample files to the library
      const sampleFiles = [
        {
          name: `E2E Test Document 1 WS${workspaceNum}.txt`,
          markdown: `# Document 1\n\nWorkspace ${workspaceNum} content.`,
        },
        {
          name: `E2E Test Document 2 WS${workspaceNum}.txt`,
          markdown: `# Document 2\n\nWorkspace ${workspaceNum} content.`,
        },
        {
          name: `E2E Test Document 3 WS${workspaceNum}.txt`,
          markdown: `# Document 3\n\nWorkspace ${workspaceNum} content.`,
        },
      ]

      for (const file of sampleFiles) {
        await client.query(
          `
          INSERT INTO "AiLibraryFile" (id, "libraryId", name, "docPath", "mimeType", size, "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), $1, $2, $3, 'text/plain', 100, NOW(), NOW())
        `,
          [libraryId, file.name, `/tmp/e2e/${file.name}`],
        )
      }
      console.log(`  ✅ Added ${sampleFiles.length} sample files to test library WS${workspaceNum}`)

      // Delete existing test list for clean state
      await client.query(
        `DELETE FROM "AiListSource" WHERE "listId" IN (SELECT id FROM "AiList" WHERE name = $1 AND "workspaceId" = $2)`,
        [`E2E Test List${listSuffix}`, workspaceId],
      )
      await client.query(`DELETE FROM "AiList" WHERE name = $1 AND "workspaceId" = $2`, [
        `E2E Test List${listSuffix}`,
        workspaceId,
      ])

      // Create the test list
      const listResult = await client.query(
        `
        INSERT INTO "AiList" (id, "workspaceId", "ownerId", name, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())
        RETURNING id
      `,
        [workspaceId, ownerId, `E2E Test List${listSuffix}`],
      )
      const listId = listResult.rows[0].id
      console.log(`  ✅ Created test list: E2E Test List${listSuffix}`)

      // Add a list source
      const sourceResult = await client.query(
        `INSERT INTO "AiListSource" (id, "listId", "libraryId", "createdAt") VALUES (gen_random_uuid(), $1, $2, NOW()) RETURNING id`,
        [listId, libraryId],
      )
      const sourceId = sourceResult.rows[0].id
      console.log(`  ✅ Added library source to test list WS${workspaceNum}`)

      // Create AiListItem records for each file
      const filesResult = await client.query(`SELECT id, name FROM "AiLibraryFile" WHERE "libraryId" = $1`, [libraryId])
      if (filesResult.rows.length === 0) {
        console.log(`  ⚠️  WARNING: No files found in library ${libraryId} for WS${workspaceNum}`)
      } else {
        console.log(`  📄 Found ${filesResult.rows.length} files in library:`)
        for (const file of filesResult.rows) {
          console.log(`     - ${file.name} (${file.id})`)
        }
      }

      for (const file of filesResult.rows) {
        await client.query(
          `INSERT INTO "AiListItem" (id, "listId", "sourceId", "sourceFileId", "itemName", "createdAt", "updatedAt")
           VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())`,
          [listId, sourceId, file.id, file.name],
        )
      }
      console.log(`  ✅ Created ${filesResult.rows.length} list items from library files WS${workspaceNum}`)

      // Add standard fields to the list
      await client.query(
        `INSERT INTO "AiListField" (id, "listId", name, type, "sourceType", "fileProperty", "order", "createdAt")
         VALUES (gen_random_uuid(), $1, 'Item Name', 'string', 'file_property', 'itemName', 0, NOW()),
                (gen_random_uuid(), $1, 'Filename', 'string', 'file_property', 'name', 1, NOW())`,
        [listId],
      )
      console.log(`  ✅ Added standard fields to test list WS${workspaceNum}`)

      // Create test assistant
      await client.query(
        `INSERT INTO "AiAssistant" (id, "workspaceId", "ownerId", name, "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW()) ON CONFLICT DO NOTHING`,
        [workspaceId, ownerId, `E2E Test Assistant - WS${workspaceNum}`],
      )
      console.log(`  ✅ Created test assistant: E2E Test Assistant - WS${workspaceNum}`)

      return { libraryId, listId }
    }

    // Create test data for both workspaces
    const ws1Data = await createWorkspaceTestData(workspace1Id, 1, userId)
    const ws2Data = await createWorkspaceTestData(workspace2Id, 2, userId)

    // Step 6: Create test connectors and automations for E2E tests
    console.log('  🔌 Creating test connectors and automations...')

    // Helper function to create connector and automation for a workspace
    const createConnectorAndAutomation = async (workspaceId: string, workspaceNum: number, listId: string) => {
      // Use plain name for WS1 (backward compat with automation.spec.ts), suffix for WS2
      const connectorName = workspaceNum === 1 ? 'E2E Test Connector' : `E2E Test Connector - WS${workspaceNum}`
      const automationName = `E2E Test Automation - WS${workspaceNum}`

      // Enable shopware6 connector type
      await client.query(
        `INSERT INTO "AiConnectorTypeWorkspace" (id, "workspaceId", "connectorType", "createdAt")
         VALUES (gen_random_uuid(), $1, 'shopware6', NOW())
         ON CONFLICT ("workspaceId", "connectorType") DO NOTHING`,
        [workspaceId],
      )
      console.log(`  ✅ Enabled shopware6 connector type for E2E Test Workspace ${workspaceNum}`)

      // Create test connector
      const connectorResult = await client.query(
        `INSERT INTO "AiConnector" (id, "workspaceId", "connectorType", "baseUrl", name, config, "isConnected", "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, 'shopware6', 'https://test-shop.example.com', $2, '{"clientId": "test", "clientSecret": "encrypted:test"}', false, NOW(), NOW())
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [workspaceId, connectorName],
      )

      let connectorId: string
      if (connectorResult.rows.length > 0) {
        connectorId = connectorResult.rows[0].id
        console.log(`  ✅ Created test connector: ${connectorName}`)
      } else {
        const existingConnector = await client.query(
          'SELECT id FROM "AiConnector" WHERE name = $1 AND "workspaceId" = $2',
          [connectorName, workspaceId],
        )
        connectorId = existingConnector.rows[0].id
        console.log(`  ℹ️  Test connector already exists: ${connectorName}`)
      }

      // Create test automation
      await client.query(
        `INSERT INTO "AiAutomation" (id, "workspaceId", name, "listId", "connectorId", "connectorAction", "connectorActionConfig", schedule, "executeOnEnrichment", "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, $2, $3, $4, 'updateProduct', '{"values": [], "fieldMappings": []}', NULL, false, NOW(), NOW())
         ON CONFLICT DO NOTHING`,
        [workspaceId, automationName, listId, connectorId],
      )
      console.log(`  ✅ Created test automation: ${automationName}`)
    }

    // Create connectors and automations for both workspaces
    await createConnectorAndAutomation(workspace1Id, 1, ws1Data.listId)
    await createConnectorAndAutomation(workspace2Id, 2, ws2Data.listId)

    console.log('✅ E2E Global Setup completed')
  } catch (error) {
    console.error('❌ E2E Global Setup failed:')
    console.error(error)
    throw error
  } finally {
    try {
      await client.end()
    } catch (error) {
      console.error('Failed to close database connection:', error)
    }
  }
}

export default globalSetup

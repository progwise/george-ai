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
      DO UPDATE SET username = $2, "isAdmin" = true, "updatedAt" = NOW()
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

import { prisma } from '@george-ai/app-database'
import { createWorkspace } from '@george-ai/app-domain'
import { TestUser, graphql, testYoga } from '@george-ai/test-utils'

import { schema } from '../..'

const { executeGraphQL } = testYoga(schema)

describe('Api Key Tests', () => {
  const now = Date.now()
  const TEST_WORKSPACE_ID = `apikey-test-workspace-${now}`
  const TEST_USER_ID = `apikey-test-user-${now}`
  let TEST_USER: TestUser

  beforeAll(async () => {
    await createWorkspace({
      workspaceId: TEST_WORKSPACE_ID,
      name: 'Api Key Test Workspace',
      slug: TEST_WORKSPACE_ID,
    })

    TEST_USER = await prisma.user.create({
      data: {
        id: TEST_USER_ID,
        username: `TEST_USER_ID-username`,
        email: `${TEST_USER_ID}@example.com`,
        defaultWorkspaceId: TEST_WORKSPACE_ID,
        isAdmin: false,
        workspaceMemberships: {
          create: {
            workspaceId: TEST_WORKSPACE_ID,
            role: 'admin',
          },
        },
      },
    })
  })

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: { in: [TEST_USER_ID] } } }).catch(() => {
      /* Ignore errors during cleanup */
    })
    // Teardown code if needed
    await prisma.aiLibrary
      .deleteMany({
        where: { workspaceId: TEST_WORKSPACE_ID },
      })
      .catch(() => {
        /* Ignore errors during cleanup */
      })
    await prisma.workspace.delete({ where: { id: TEST_WORKSPACE_ID } }).catch(() => {
      /* Ignore errors during cleanup */
    })
  })

  it('Can add an api key to the workspace', async () => {
    const document = graphql(`
      mutation generateApiKey($name: String!) {
        generateApiKey(name: $name) {
          id
          name
          key
          workspaceId
          userId
          createdAt
        }
      }
    `)
    const executionResult = await executeGraphQL(document, {
      variables: {
        name: 'Test API Key',
      },
      context: {
        session: {
          user: TEST_USER,
        },
        workspaceId: TEST_WORKSPACE_ID,
      },
    })
    const result = JSON.parse(JSON.stringify(executionResult))
    expect(result.errors).toBeUndefined()
    expect(result.data['generateApiKey']).toBeDefined()
    expect(result.data['generateApiKey'].id).toEqual(expect.any(String))
    expect(result.data['generateApiKey'].id.length).toBeGreaterThan(5)
    expect(result.data['generateApiKey'].name).toBe('Test API Key')
  })

  it('Can list api keys for the workspace', async () => {
    const document = graphql(`
      query {
        workspaceApiKeys {
          id
          name
          workspaceId
          userId
          createdAt
        }
      }
    `)
    const executionResult = await executeGraphQL(document, {
      context: {
        session: {
          user: TEST_USER,
        },
        workspaceId: TEST_WORKSPACE_ID,
      },
    })
    const result = JSON.parse(JSON.stringify(executionResult))
    expect(result.errors).toBeUndefined()
    expect(result.data['workspaceApiKeys']).toBeDefined()
    expect(Array.isArray(result.data['workspaceApiKeys'])).toBe(true)
    expect(result.data['workspaceApiKeys'].length).toBeGreaterThan(0)
    expect(result.data['workspaceApiKeys'][0].id).toEqual(expect.any(String))
    expect(result.data['workspaceApiKeys'][0].name).toBe('Test API Key')
  })
})

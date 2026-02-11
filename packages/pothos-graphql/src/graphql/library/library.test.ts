import { prisma } from '@george-ai/app-database'
import { TestUser, graphql, testYoga } from '@george-ai/test-utils'

import { schema } from '../..'

const { executeGraphQL } = testYoga(schema)

describe('GraphQL Library Tests', () => {
  const now = Date.now()
  const TEST_WORKSPACE_ID = `test-workspace-ai-library-${now}`
  const TEST_USER_ID = `test-user-ai-library-${now}`
  const TEST_ADMIN_USER_ID = `test-admin-user-ai-library-${now}`
  const TEST_OWNER_USER_ID = `test-owner-user-ai-library-${now}`
  let TEST_USER: TestUser
  let TEST_ADMIN_USER: TestUser

  beforeAll(async () => {
    await prisma.workspace.create({
      data: {
        id: TEST_WORKSPACE_ID,
        name: 'Test Workspace for AI Library',
        slug: `test-workspace-ai-library-${now}`,
      },
    })

    await prisma.user.create({
      data: {
        id: TEST_OWNER_USER_ID,
        username: `test-owner-ai-library-${now}`,
        email: `test-owner-ai-library-${now}@example.com`,
        defaultWorkspaceId: TEST_WORKSPACE_ID,
        isAdmin: false,
        workspaceMemberships: {
          create: {
            workspaceId: TEST_WORKSPACE_ID,
            role: 'owner',
          },
        },
      },
    })

    TEST_USER = await prisma.user.create({
      data: {
        id: TEST_USER_ID,
        username: `test-user-ai-library-${now}`,
        email: `test-user-ai-library-${now}@example.com`,
        defaultWorkspaceId: TEST_WORKSPACE_ID,
        isAdmin: false,
        workspaceMemberships: {
          create: {
            workspaceId: TEST_WORKSPACE_ID,
            role: 'member',
          },
        },
      },
    })

    TEST_ADMIN_USER = await prisma.user.create({
      data: {
        id: TEST_ADMIN_USER_ID,
        username: `test-admin-user-ai-library-${now}`,
        email: `test-admin-user-ai-library-${now}@example.com`,
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
    // Teardown code if needed
    await prisma.aiLibrary
      .deleteMany({
        where: { ownerId: { in: [TEST_USER_ID, TEST_ADMIN_USER_ID] } },
      })
      .catch(() => {
        /* Ignore errors during cleanup */
      })
    await prisma.user.deleteMany({ where: { id: { in: [TEST_USER_ID, TEST_ADMIN_USER_ID] } } }).catch(() => {
      /* Ignore errors during cleanup */
    })
    await prisma.workspace.delete({ where: { id: TEST_WORKSPACE_ID } }).catch(() => {
      /* Ignore errors during cleanup */
    })
  })

  it('Cannot create library without write access', async () => {
    const document = graphql(`
      mutation createLibrary($data: LibraryInput!) {
        createLibrary(data: $data) {
          id
          name
        }
      }
    `)
    const result = await executeGraphQL(document, {
      variables: {
        data: {
          name: 'Test AI Library',
        },
      },
      context: {
        session: {
          user: TEST_USER,
        },
        workspaceId: TEST_WORKSPACE_ID,
      },
    })
    expect(result.errors?.length).toBeGreaterThan(0)
    expect(result.errors![0].message).toContain('You do not have write access')
    expect(result.data!['createLibrary']).toBeNull()
  })

  it('Can create library with write access', async () => {
    const document = graphql(`
      mutation createLibrary($data: LibraryInput!) {
        createLibrary(data: $data) {
          id
          name
        }
      }
    `)
    const executionResult = await executeGraphQL(document, {
      variables: {
        data: {
          name: 'Test AI Library',
        },
      },
      context: {
        session: {
          user: TEST_ADMIN_USER,
        },
        workspaceId: TEST_WORKSPACE_ID,
      },
    })
    const result = JSON.parse(JSON.stringify(executionResult))
    expect(result.errors).toBeUndefined()
    expect(result.data['createLibrary']).toBeDefined()
    expect(result.data['createLibrary'].id).toEqual(expect.any(String))
    expect(result.data['createLibrary'].id.length).toBeGreaterThan(5)
    expect(result.data['createLibrary'].name).toBe('Test AI Library')
  })
})

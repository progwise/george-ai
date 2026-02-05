import { prisma } from '@george-ai/app-database'
import { workspace } from '@george-ai/app-domain'

import { type TestUser, executeGraphQL, graphql } from '../../testing'

export {} from 'graphql'

describe('GraphQL AI Library Tests', () => {
  const now = Date.now()
  const TEST_WORKSPACE_ID = `test-workspace-ai-library-${now}`
  const TEST_USER_ID = `test-user-ai-library-${now}`
  const TEST_ADMIN_USER_ID = `test-admin-user-ai-library-${now}`
  let TEST_USER: TestUser
  let TEST_ADMIN_USER: TestUser

  beforeAll(async () => {
    await workspace.createWorkspace({
      id: TEST_WORKSPACE_ID,
      name: 'Test Workspace for AI Library',
      slug: `test-workspace-ai-library-${now}`,
      userId: TEST_USER_ID,
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
    await prisma.aiLibrary.deleteMany({
      where: { ownerId: { in: [TEST_USER_ID, TEST_ADMIN_USER_ID] } },
    })
    await prisma.user.deleteMany({ where: { id: { in: [TEST_USER_ID, TEST_ADMIN_USER_ID] } } })
    await prisma.workspace.delete({ where: { id: TEST_WORKSPACE_ID } })
  })

  it('Cannot create library without write access', async () => {
    const document = graphql(`
      mutation createLibrary($data: AiLibraryInput!) {
        createLibrary(data: $data) {
          id
          name
          ownerId
        }
      }
    `)
    const result = await executeGraphQL(document, {
      variables: {
        data: {
          name: 'Test AI Library',
        },
      },
      user: TEST_USER,
      workspaceId: TEST_WORKSPACE_ID,
    })
    expect(result.errors).toBeDefined()
    expect(result.data!['createLibrary']).toBeNull()
  })

  it('Can create library with write access', async () => {
    const document = graphql(`
      mutation createLibrary($data: AiLibraryInput!) {
        createLibrary(data: $data) {
          id
          name
          ownerId
        }
      }
    `)
    const result = await executeGraphQL(document, {
      variables: {
        data: {
          name: 'Test AI Library',
        },
      },
      user: TEST_ADMIN_USER,
      workspaceId: TEST_WORKSPACE_ID,
    })
    expect(result.errors).toBeUndefined()
    expect(result.data!['createLibrary']).toBeDefined()
    console.log(result.data!['createLibrary'])
  })
})

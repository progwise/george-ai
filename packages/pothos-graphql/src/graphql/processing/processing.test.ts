import { prisma } from '@george-ai/app-database'
import { createWorkspace } from '@george-ai/app-domain'
import { TestUser, graphql, testYoga } from '@george-ai/test-utils'

import { schema } from '../..'

const { executeGraphQL } = testYoga(schema)

describe('GraphQL Processing Tests', () => {
  const now = Date.now()
  const TEST_WORKSPACE_ID = `test-workspace-processing-${now}`
  const TEST_USER_ID = `test-user-processing-${now}`
  const TEST_ADMIN_USER_ID = `test-admin-user-processing-${now}`
  const TEST_OWNER_USER_ID = `test-owner-user-processing-${now}`
  let TEST_USER: TestUser

  beforeAll(async () => {
    await createWorkspace({
      workspaceId: TEST_WORKSPACE_ID,
      name: 'Test Workspace for AI Library',
      slug: `test-workspace-processing-${now}`,
    })

    await prisma.user.create({
      data: {
        id: TEST_OWNER_USER_ID,
        username: `test-owner-processing-${now}`,
        email: `test-owner-processing-${now}@example.com`,
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
        username: `test-user-processing-${now}`,
        email: `test-user-processing-${now}@example.com`,
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
  })

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: { in: [TEST_USER_ID, TEST_ADMIN_USER_ID] } } }).catch(() => {
      /* Ignore errors during cleanup */
    })
    await prisma.workspace.delete({ where: { id: TEST_WORKSPACE_ID } }).catch(() => {
      /* Ignore errors during cleanup */
    })
  })

  it('Can query the event queue stats for a workspace', async () => {
    const document = graphql(`
      query eventQueueStats($workspaceId: String!) {
        eventQueueStats(workspaceId: $workspaceId) {
          action
          status
          error
          pending
          delivered
          redelivered
          waiting
        }
      }
    `)
    const result = await executeGraphQL(document, {
      variables: {
        workspaceId: TEST_WORKSPACE_ID,
      },
      context: {
        session: {
          user: TEST_USER,
        },
        workspaceId: TEST_WORKSPACE_ID,
      },
    })
    expect(result.errors).toBeUndefined()
    expect(result.data!['eventQueueStats']).toBeDefined()
    console.log(result.data)
  })

  it('Can query the event queue requests for a workspace', async () => {
    const document = graphql(`
      query eventQueueRequests($workspaceId: String!, $action: EventQueueAction!) {
        eventQueueRequests(workspaceId: $workspaceId, action: $action) {
          totalMessages
          lastSequence
          requests {
            workspaceId
            action
            timestamp
            ... on DocumentExtractionRequest {
              extractionMethod
              libraryId
              documentId
            }
            ... on DocumentVectorizationRequest {
              libraryId
              documentId
              splitMethod
              extractionMethod
              embeddingDriver
              embeddingModel
            }
            ... on FieldEnrichmentRequest {
              fieldId
              chatModelDriver
              chatModelName
            }
          }
        }
      }
    `)
    const result = await executeGraphQL(document, {
      variables: {
        workspaceId: TEST_WORKSPACE_ID,
        action: 'documentExtraction',
      },
      context: {
        session: {
          user: TEST_USER,
        },
        workspaceId: TEST_WORKSPACE_ID,
      },
    })
    expect(result.errors).toBeUndefined()
    expect(result.data!['eventQueueRequests']).toBeDefined()
    console.log(result.data)
  })
})

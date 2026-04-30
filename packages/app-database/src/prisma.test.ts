import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { prisma } from './prisma'

describe('Prisma Client', () => {
  const now = Date.now()
  const TEST_WORKSPACE_ID = `test-workspace-id-${now}`
  const TEST_USER_ID = `test-user-id-${now}`

  beforeAll(async () => {
    // Create a test workspace first
    await prisma.workspace.create({
      data: {
        id: TEST_WORKSPACE_ID,
        name: 'Test Workspace',
        slug: `ws_${now}`,
      },
    })

    // Then create a user with the workspace as default
    await prisma.user.create({
      data: {
        id: TEST_USER_ID,
        email: `test-${now}@example.com`,
        username: `testuser-${now}`,
        name: 'Test User',
        defaultWorkspaceId: TEST_WORKSPACE_ID,
        workspaceMemberships: {
          create: {
            role: 'owner',
            workspaceId: TEST_WORKSPACE_ID,
          },
        },
      },
    })
  })

  afterAll(async () => {
    // Clean up test data (delete users first to respect foreign key constraints)
    await prisma.user.deleteMany({
      where: { email: { startsWith: `test-${now}@` } },
    })
    await prisma.workspace.deleteMany({
      where: { name: { startsWith: `ws_${now}` } },
    })
  })

  it('should connect to database', async () => {
    // Simple query to verify connection
    const workspaces = await prisma.workspace.findMany()
    expect(workspaces).toBeDefined()
    expect(Array.isArray(workspaces)).toBe(true)
  })

  it('should create and read workspace', async () => {
    const workspace = await prisma.workspace.findUnique({
      where: { id: TEST_WORKSPACE_ID },
    })

    expect(workspace).toBeDefined()
    expect(workspace?.name).toBe('Test Workspace')
  })

  it('should handle transactions', async () => {
    const result = await prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.findUnique({
        where: { id: TEST_WORKSPACE_ID },
      })

      const count = await tx.workspace.count()

      return { workspace, count }
    })

    expect(result.workspace).toBeDefined()
    expect(result.count).toBeGreaterThan(0)
  })

  it('should use Prisma enums', async () => {
    const member = await prisma.workspaceMember.findFirst({
      where: { workspaceId: TEST_WORKSPACE_ID, userId: TEST_USER_ID },
    })

    expect(member).toBeDefined()
    expect(['owner', 'admin', 'member']).toContain(member?.role)
  })
})

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { prisma } from './prisma'

describe('Prisma Client', () => {
  let testWorkspaceId: string

  beforeAll(async () => {
    // Create a test workspace first
    const workspace = await prisma.workspace.create({
      data: {
        name: 'Test Workspace',
        slug: 'test-workspace',
      },
    })
    testWorkspaceId = workspace.id

    // Then create a user with the workspace as default
    await prisma.user.create({
      data: {
        email: 'test@example.com',
        username: 'testuser',
        name: 'Test User',
        defaultWorkspaceId: workspace.id,
        workspaceMemberships: {
          create: {
            role: 'OWNER',
            workspaceId: workspace.id,
          },
        },
      },
    })
  })

  afterAll(async () => {
    // Clean up test data (delete users first to respect foreign key constraints)
    await prisma.user.deleteMany({
      where: { email: { startsWith: 'test@' } },
    })
    await prisma.workspace.deleteMany({
      where: { name: { startsWith: 'Test' } },
    })

    // Disconnect Prisma client
    await prisma.$disconnect()
  })

  it('should connect to database', async () => {
    // Simple query to verify connection
    const workspaces = await prisma.workspace.findMany()
    expect(workspaces).toBeDefined()
    expect(Array.isArray(workspaces)).toBe(true)
  })

  it('should create and read workspace', async () => {
    const workspace = await prisma.workspace.findUnique({
      where: { id: testWorkspaceId },
    })

    expect(workspace).toBeDefined()
    expect(workspace?.name).toBe('Test Workspace')
  })

  it('should handle transactions', async () => {
    const result = await prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.findUnique({
        where: { id: testWorkspaceId },
      })

      const count = await tx.workspace.count()

      return { workspace, count }
    })

    expect(result.workspace).toBeDefined()
    expect(result.count).toBeGreaterThan(0)
  })

  it('should use Prisma enums', async () => {
    const member = await prisma.workspaceMember.findFirst({
      where: { workspaceId: testWorkspaceId },
    })

    expect(member).toBeDefined()
    expect(['OWNER', 'ADMIN', 'MEMBER']).toContain(member?.role)
  })
})

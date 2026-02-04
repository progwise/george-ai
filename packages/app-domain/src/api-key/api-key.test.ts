import { prisma } from '@george-ai/app-database'

import { default as apiKey } from '.'

describe('API Key Tests', () => {
  const now = Date.now()
  const TEST_USER_ID = `test_user:${now}`
  const TEST_WORKSPACE_ID = `test_workspace:${now}`
  const TEST_LIBRARY_ID = `test_library:${now}`

  beforeAll(async () => {
    await prisma.workspace.create({
      data: {
        id: TEST_WORKSPACE_ID,
        name: 'Test Workspace',
        slug: `ws-${now}`,
      },
    })
    await prisma.user.create({
      data: {
        id: TEST_USER_ID,
        name: `Test User ${TEST_USER_ID}`,
        username: `testuser ${TEST_USER_ID}`,
        email: `${TEST_USER_ID}@example.com`,
        defaultWorkspaceId: TEST_WORKSPACE_ID,
      },
    })
    await prisma.workspaceMember.create({
      data: {
        userId: TEST_USER_ID,
        workspaceId: TEST_WORKSPACE_ID,
        role: 'owner',
      },
    })
    await prisma.aiLibrary.create({
      data: {
        id: TEST_LIBRARY_ID,
        name: 'Test Library',
        workspaceId: TEST_WORKSPACE_ID,
        ownerId: TEST_USER_ID,
      },
    })
  })

  afterAll(async () => {
    await prisma.aiLibrary.deleteMany({ where: { id: TEST_LIBRARY_ID } })
    await prisma.user.deleteMany({ where: { id: TEST_USER_ID } })
    await prisma.workspace.deleteMany({ where: { id: TEST_WORKSPACE_ID } })
  })

  it('Should generate a new key', async () => {
    const { key, keyHash } = await apiKey.generateKey()
    expect(key).toHaveLength(64)
    expect(keyHash).toBeDefined()
  })

  it('Should validate a key against its hash', async () => {
    const generated = await apiKey.generateKey()
    await prisma.apiKey.create({
      data: {
        id: `api_key:${Date.now()}`,
        userId: TEST_USER_ID,
        libraryId: TEST_LIBRARY_ID,
        name: 'Test API Key',
        keyHash: generated.keyHash,
      },
    })
    const isValid = await apiKey.validateApiKey({ apiKey: generated.key, libraryId: TEST_LIBRARY_ID })
    expect(isValid).toEqual({ userId: TEST_USER_ID, libraryId: TEST_LIBRARY_ID, apiKeyId: expect.any(String) })
  })
})

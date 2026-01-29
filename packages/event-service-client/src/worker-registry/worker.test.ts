import { initializeEventServiceClient } from '..'
import { default as workerRegistry } from './index'

describe.sequential('event-service-client worker tests', () => {
  const TEST_WORKER_ID = `test-worker-123_${Date.now()}`
  const TEST_WORKER2_ID = `test-worker-456_${Date.now()}`
  const TEST_WORKER3_ID = `test-worker-789_${Date.now()}`

  beforeAll(async () => {
    // Ensure workspace is clean before tests
    await initializeEventServiceClient()
  })

  afterAll(async () => {
    await workerRegistry.deleteWorker(TEST_WORKER_ID)
    await workerRegistry.deleteWorker(TEST_WORKER2_ID)
    await workerRegistry.deleteWorker(TEST_WORKER3_ID)
  })

  test('should signup', async () => {
    const entries = await workerRegistry.signup({
      workerId: TEST_WORKER_ID,
    })
    expect(entries.length).toBeGreaterThan(0)
    const healthManagementEntry = entries.find((entry) => entry.workerType === 'AI_HEALTH_MANAGEMENT')
    expect(healthManagementEntry).toBeDefined()
    expect(healthManagementEntry?.workerId).toBe(TEST_WORKER_ID)
  })

  test('should get worker that does not exist', async () => {
    const retrievedEntry = await workerRegistry.getWorkerRegistryEntry({
      workerId: 'non-existent-worker-id',
      workerType: 'AI_HEALTH_MANAGEMENT',
    })
    expect(retrievedEntry).toBeNull()
  })

  test('should get worker that was just created', async () => {
    const retrievedEntry = await workerRegistry.getWorkerRegistryEntry({
      workerId: TEST_WORKER_ID,
      workerType: 'AI_HEALTH_MANAGEMENT',
    })

    expect(retrievedEntry).not.toBeNull()
    expect(retrievedEntry?.workerId).toBe(TEST_WORKER_ID)
    expect(retrievedEntry?.workerType).toBe('AI_HEALTH_MANAGEMENT')
  })

  test('should update worker heartbeat', async () => {
    const beforeUpdate = await workerRegistry.getWorkerRegistryEntry({
      workerId: TEST_WORKER_ID,
      workerType: 'AI_HEALTH_MANAGEMENT',
    })
    expect(beforeUpdate).not.toBeNull()
    const beforeHeartbeat = beforeUpdate!.lastHeartbeat

    // Wait a bit to ensure heartbeat timestamp will be different
    await new Promise((resolve) => setTimeout(resolve, 100))

    await workerRegistry.updateWorkerHeartbeat({
      workerId: TEST_WORKER_ID,
      workerType: 'AI_HEALTH_MANAGEMENT',
    })

    const afterUpdate = await workerRegistry.getWorkerRegistryEntry({
      workerId: TEST_WORKER_ID,
      workerType: 'AI_HEALTH_MANAGEMENT',
    })
    expect(afterUpdate).not.toBeNull()
    const afterHeartbeat = afterUpdate!.lastHeartbeat

    expect(new Date(afterHeartbeat).getTime()).toBeGreaterThan(new Date(beforeHeartbeat).getTime())
  })

  test('should signup another worker', async () => {
    const entries = await workerRegistry.signup({
      workerId: TEST_WORKER2_ID,
    })

    console.log('Worker signup entries', { entries })

    expect(entries.length).toBeGreaterThan(0)
    const workspaceProcessingEntry = entries.find((entry) => entry.workerType === 'WORKSPACE_PROCESSING')
    expect(workspaceProcessingEntry).toBeDefined()
    expect(workspaceProcessingEntry?.workerId).toBe(TEST_WORKER2_ID)
  })

  test('should signup a third worker without AI_HEALTH_MANAGEMENT', async () => {
    const entries = await workerRegistry.signup({
      workerId: TEST_WORKER3_ID,
    })

    expect(entries.length).toBeGreaterThan(0)
    const providerCallingEntry = entries.find((entry) => entry.workerType === 'AI_PROVIDER_CALLING')
    expect(providerCallingEntry).toBeDefined()
    expect(providerCallingEntry?.workerId).toBe(TEST_WORKER3_ID)

    const healthManagementEntry = entries.find((entry) => entry.workerType === 'AI_HEALTH_MANAGEMENT')
    expect(healthManagementEntry).toBeUndefined()
  })

  test('should get all worker registry entries', async () => {
    const allEntries = await workerRegistry.getAllWorkerRegistryEntries()
    const healthManagementWorkerEntries = allEntries.filter((entry) => entry.workerType === 'AI_HEALTH_MANAGEMENT')
    const workspaceProcessingEntries = allEntries.filter((entry) => entry.workerType === 'WORKSPACE_PROCESSING')
    const providerCallEntries = allEntries.filter((entry) => entry.workerType === 'AI_PROVIDER_CALLING')

    expect(healthManagementWorkerEntries.length).toBeGreaterThanOrEqual(1)
    expect(healthManagementWorkerEntries.length).toBeLessThanOrEqual(2) // Because we only allow 2 max

    expect(workspaceProcessingEntries.length).toBeGreaterThanOrEqual(1)
    expect(providerCallEntries.length).toBeGreaterThanOrEqual(1)
  })

  test('should delete worker', async () => {
    await workerRegistry.deleteWorker(TEST_WORKER2_ID)

    const retrievedEntries = await workerRegistry.getWorkerRegistryEntries({
      workerId: TEST_WORKER2_ID,
    })

    expect(retrievedEntries.length).toBe(0)
  })
})

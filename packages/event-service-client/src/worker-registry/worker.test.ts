import { initializeEventServiceClient } from '..'
import { default as workerRegistry } from './index'

describe.sequential('event-service-client worker tests', () => {
  const TEST_WORKER_ID = `test-worker-123_${Date.now()}`
  const TEST_WORKER2_ID = `test-worker-456_${Date.now()}`

  beforeAll(async () => {
    // Ensure workspace is clean before tests
    await initializeEventServiceClient()
  })

  afterAll(async () => {
    await workerRegistry.deleteWorker(TEST_WORKER_ID)
    await workerRegistry.deleteWorker(TEST_WORKER2_ID)
  })

  test('should register and get new AI_HEALTH_MANAGEMENT worker', async () => {
    await workerRegistry.registerWorker({
      version: 1,
      workerId: TEST_WORKER_ID,
      workerType: 'AI_HEALTH_MANAGEMENT',
      lastHeartbeat: new Date().toISOString(),
    })
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

  test('should create WORKSPACE_PROCESSING worker', async () => {
    await workerRegistry.registerWorker({
      version: 1,
      workerId: TEST_WORKER2_ID,
      workerType: 'WORKSPACE_PROCESSING',
      lastHeartbeat: new Date().toISOString(),
    })
  })

  test('should create AI_PROVIDER_CALLING worker', async () => {
    await workerRegistry.registerWorker({
      version: 1,
      workerId: TEST_WORKER2_ID,
      workerType: 'AI_PROVIDER_CALLING',
      lastHeartbeat: new Date().toISOString(),
    })
  })

  test('should get all worker registry entries', async () => {
    const allEntries = await workerRegistry.getAllWorkerRegistryEntries()
    const worker1 = allEntries.find(
      (entry) => entry.workerId === TEST_WORKER_ID && entry.workerType === 'AI_HEALTH_MANAGEMENT',
    )
    const worker2 = allEntries.find(
      (entry) => entry.workerId === TEST_WORKER2_ID && entry.workerType === 'WORKSPACE_PROCESSING',
    )

    const worker3 = allEntries.find(
      (entry) => entry.workerId === TEST_WORKER2_ID && entry.workerType === 'AI_PROVIDER_CALLING',
    )

    expect(allEntries.length).toBeGreaterThanOrEqual(3)
    expect(worker1).toBeDefined()
    expect(worker2).toBeDefined()
    expect(worker3).toBeDefined()
  })

  test('should delete worker', async () => {
    await workerRegistry.deleteWorker(TEST_WORKER2_ID)

    const retrievedEntries = await workerRegistry.getWorkerRegistryEntries({
      workerId: TEST_WORKER2_ID,
    })

    expect(retrievedEntries.length).toBe(0)
  })
})

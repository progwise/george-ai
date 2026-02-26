import { isEventServiceClientInitialized } from '..'
import { default as workerRegistry } from './index'

describe.sequential('event-service-client worker tests', () => {
  const now = Date.now()
  const TEST_WORKER_IDS = Array.from({ length: 10 }, (_, i) => `test-worker-${i + 1}_${now}`)

  beforeAll(async () => {
    // Ensure workspace is clean before tests
    await isEventServiceClientInitialized()

    const entries = await workerRegistry.getWorker()
    await Promise.all(entries.map((entry) => workerRegistry.deleteWorker(entry.workerId)))
  })

  afterAll(async () => {
    await Promise.all(TEST_WORKER_IDS.map((workerId) => workerRegistry.deleteWorker(workerId)))
  })

  test('should signup', async () => {
    const entries = await workerRegistry.signupWorker({
      workerId: TEST_WORKER_IDS[0],
    })
    expect(entries.length).toBeGreaterThan(0)
    const workspaceManager = entries.find((entry) => entry.workerType === 'WORKSPACE_MANAGER')
    expect(workspaceManager).toBeDefined()
    expect(workspaceManager?.workerId).toBe(TEST_WORKER_IDS[0])
  })

  test('should get worker that does not exist', async () => {
    const retrievedEntry = await workerRegistry.getWorkerEntry({
      workerId: 'non-existent-worker-id',
      workerType: 'WORKSPACE_MANAGER',
    })
    expect(retrievedEntry).toBeNull()
  })

  test('should get worker that was just created', async () => {
    const retrievedEntry = await workerRegistry.getWorkerEntry({
      workerId: TEST_WORKER_IDS[0],
      workerType: 'WORKSPACE_MANAGER',
    })

    expect(retrievedEntry).not.toBeNull()
    expect(retrievedEntry?.workerId).toBe(TEST_WORKER_IDS[0])
    expect(retrievedEntry?.workerType).toBe('WORKSPACE_MANAGER')
  })

  test('should update worker heartbeat', async () => {
    const beforeUpdate = await workerRegistry.getWorkerEntry({
      workerId: TEST_WORKER_IDS[0],
      workerType: 'WORKSPACE_MANAGER',
    })
    expect(beforeUpdate).not.toBeNull()
    const beforeHeartbeat = beforeUpdate!.lastHeartbeat

    // Wait a bit to ensure heartbeat timestamp will be different
    await new Promise((resolve) => setTimeout(resolve, 100))

    await workerRegistry.updateWorkerHeartbeat({
      workerId: TEST_WORKER_IDS[0],
      workerType: 'WORKSPACE_MANAGER',
    })

    const afterUpdate = await workerRegistry.getWorkerEntry({
      workerId: TEST_WORKER_IDS[0],
      workerType: 'WORKSPACE_MANAGER',
    })
    expect(afterUpdate).not.toBeNull()
    const afterHeartbeat = afterUpdate!.lastHeartbeat

    expect(new Date(afterHeartbeat).getTime()).toBeGreaterThan(new Date(beforeHeartbeat).getTime())
  })

  test('should signup another worker', async () => {
    const entries = await workerRegistry.signupWorker({
      workerId: TEST_WORKER_IDS[1],
    })

    console.log('Worker signup entries', { entries })

    expect(entries.length).toBeGreaterThan(0)
    const workspaceProcessingEntry = entries.find((entry) => entry.workerType === 'DOCUMENT_PROCESSING')
    expect(workspaceProcessingEntry).toBeDefined()
    expect(workspaceProcessingEntry?.workerId).toBe(TEST_WORKER_IDS[1])
  })

  test('should signup a third worker without WORKSPACE_MANAGER', async () => {
    const entries = await workerRegistry.signupWorker({
      workerId: TEST_WORKER_IDS[2],
    })

    expect(entries.length).toBeGreaterThan(0)
    const providerCallingEntry = entries.find((entry) => entry.workerType === 'MODEL_CALL_RESPONDER')
    expect(providerCallingEntry).toBeDefined()
    expect(providerCallingEntry?.workerId).toBe(TEST_WORKER_IDS[2])

    const healthManagementEntry = entries.find((entry) => entry.workerType === 'WORKSPACE_MANAGER')
    expect(healthManagementEntry).toBeUndefined()
  })

  test('should get all worker registry entries', async () => {
    const allEntries = await workerRegistry.getWorker()
    const healthManagementWorkerEntries = allEntries.filter((entry) => entry.workerType === 'WORKSPACE_MANAGER')
    const workspaceProcessingEntries = allEntries.filter((entry) => entry.workerType === 'DOCUMENT_PROCESSING')
    const providerCallEntries = allEntries.filter((entry) => entry.workerType === 'MODEL_CALL_RESPONDER')

    expect(healthManagementWorkerEntries.length).toBeGreaterThanOrEqual(1)
    expect(healthManagementWorkerEntries.length).toBeLessThanOrEqual(2) // Because we only allow 2 max

    expect(workspaceProcessingEntries.length).toBeGreaterThanOrEqual(1)
    expect(providerCallEntries.length).toBeGreaterThanOrEqual(1)
  })

  test('should delete worker', async () => {
    await workerRegistry.deleteWorker(TEST_WORKER_IDS[1])

    const retrievedEntries = await workerRegistry.getWorker({
      workerId: TEST_WORKER_IDS[1],
    })

    expect(retrievedEntries.length).toBe(0)
  })

  test('Should return the correct available slots', async () => {
    const slotsBefore = await workerRegistry.availableWorkerSlots()

    // Sign up a new worker which should take the last WORKSPACE_MANAGER slot
    const entries = await workerRegistry.signupWorker({
      workerId: TEST_WORKER_IDS[3],
    })
    const workspaceManagerEntry = entries.find((entry) => entry.workerType === 'WORKSPACE_MANAGER')

    const slotsAfter = await workerRegistry.availableWorkerSlots()
    if (workspaceManagerEntry) {
      expect(slotsAfter['WORKSPACE_MANAGER']).toBe(slotsBefore['WORKSPACE_MANAGER'] - 1)
    } else {
      expect(slotsAfter['WORKSPACE_MANAGER']).toBe(slotsBefore['WORKSPACE_MANAGER'])
    }
    expect(slotsAfter['DOCUMENT_PROCESSING']).toBe(slotsBefore['DOCUMENT_PROCESSING'] - 1) // Because we have 2 workers with this type already, but the limit is 1000
    expect(slotsAfter['MODEL_CALL_RESPONDER']).toBe(slotsBefore['MODEL_CALL_RESPONDER'] - 1) // Because we have 2 workers with this type already, but the limit is 1000
  })

  test('should register a new worker type for existing worker', async () => {
    const newEntry = await workerRegistry.registerWorker({
      workerId: TEST_WORKER_IDS[4],
      workerType: 'DOCUMENT_PROCESSING',
    })

    expect(newEntry).not.toBeNull()
    expect(newEntry.workerId).toBe(TEST_WORKER_IDS[4])
    expect(newEntry.workerType).toBe('DOCUMENT_PROCESSING')
  })

  test('should not register a worker if already registered', async () => {
    const firstEntry = await workerRegistry.registerWorker({
      workerId: TEST_WORKER_IDS[5],
      workerType: 'DOCUMENT_PROCESSING',
    })

    const secondEntry = await workerRegistry.registerWorker({
      workerId: TEST_WORKER_IDS[5],
      workerType: 'DOCUMENT_PROCESSING',
    })

    expect(secondEntry).not.toBeNull()
    expect(secondEntry.workerId).toBe(TEST_WORKER_IDS[5])
    expect(secondEntry.workerType).toBe('DOCUMENT_PROCESSING')
    expect(secondEntry.lastHeartbeat).toBe(firstEntry.lastHeartbeat) // Because it should return the existing entry without updating heartbeat
  })

  test('should register a worker that was previously deleted', async () => {
    const workerId = TEST_WORKER_IDS[6]
    await workerRegistry.registerWorker({
      workerId,
      workerType: 'DOCUMENT_PROCESSING',
    })

    await workerRegistry.deleteWorker(workerId)

    const newEntry = await workerRegistry.registerWorker({
      workerId,
      workerType: 'DOCUMENT_PROCESSING',
    })

    expect(newEntry).not.toBeNull()
    expect(newEntry.workerId).toBe(workerId)
    expect(newEntry.workerType).toBe('DOCUMENT_PROCESSING')
  })

  test('Should not register a worker if no slots are available', async () => {
    await expect(() =>
      Promise.all(
        Array.from({ length: 3 }, (_, i) =>
          workerRegistry.registerWorker({
            workerId: TEST_WORKER_IDS[7 + i],
            workerType: 'WORKSPACE_MANAGER', // This type only has 2 slots, so the 3rd registration should fail
          }),
        ),
      ),
    ).rejects.toThrowError('No available slots for worker type: WORKSPACE_MANAGER')
  })
})

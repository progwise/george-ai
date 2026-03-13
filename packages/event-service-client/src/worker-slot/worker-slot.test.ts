import { isEventServiceClientInitialized } from '..'
import { logger } from './common'
import { deleteWorkerSlots } from './delete'
import { getWorkerSlotEntry, getWorkerSlots } from './get'
import { heartbeatWorkerSlot } from './heartbeat'
import { signupWorker } from './signup-worker'
import { workerSlotStats } from './stats'

describe.sequential('event-service-client worker slot tests', () => {
  const now = Date.now()
  const TEST_WORKER_IDS = Array.from({ length: 30 }, (_, i) => `test-worker-${i + 1}_${now}`)

  beforeAll(async () => {
    // Ensure workspace is clean before tests
    await isEventServiceClientInitialized()
  })

  afterAll(async () => {
    // Clean up all possible test IDs
    const results = await Promise.allSettled(TEST_WORKER_IDS.map((workerId) => deleteWorkerSlots(workerId)))

    // Log failures only if they occurred
    results.forEach((result, i) => {
      if (result.status === 'rejected') {
        logger.error(`Cleanup failed for ${TEST_WORKER_IDS[i]}`, result.reason)
      }
    })
  })

  test('should signup', async () => {
    const signedUpWorkerRoles = await signupWorker({
      workerId: TEST_WORKER_IDS[0],
    })

    expect(signedUpWorkerRoles.length).toBeGreaterThan(0)
    expect(new Set(signedUpWorkerRoles).size).toBe(signedUpWorkerRoles.length) // Ensure no duplicates

    const entries = await getWorkerSlots({ workerId: TEST_WORKER_IDS[0] })

    expect(entries.length).toBe(signedUpWorkerRoles.length)
    expect(entries.map((entry) => entry.role).sort()).toEqual(signedUpWorkerRoles.sort())

    entries.forEach((entry) => {
      expect(entry.workerId).toBe(TEST_WORKER_IDS[0])
      expect(signedUpWorkerRoles).toContain(entry.role)
    })
  })

  test('should get worker that does not exist', async () => {
    const retrievedEntry = await getWorkerSlotEntry({
      workerId: 'non-existent-worker-id',
      role: 'workerSlotManager',
    })
    expect(retrievedEntry).toBeNull()
  })

  test('should get worker that was just created', async () => {
    const retrievedEntry = await getWorkerSlotEntry({
      workerId: TEST_WORKER_IDS[0],
      role: 'workspaceProcessing',
    })

    expect(retrievedEntry?.revision).toBeGreaterThan(0)
    expect(retrievedEntry?.entry).not.toBeNull()
    expect(retrievedEntry?.entry.workerId).toBe(TEST_WORKER_IDS[0])
    expect(retrievedEntry?.entry.role).toBe('workspaceProcessing')
  })

  test('should update worker heartbeat', async () => {
    await heartbeatWorkerSlot({
      workerId: TEST_WORKER_IDS[0],
      role: 'registryManager',
    })

    const beforeUpdate = await getWorkerSlotEntry({
      workerId: TEST_WORKER_IDS[0],
      role: 'registryManager',
    })

    expect(beforeUpdate?.entry).not.toBeNull()
    const beforeHeartbeat = beforeUpdate!.entry.lastHeartbeat
    expect(beforeHeartbeat).toBeDefined()

    // Wait a bit to ensure heartbeat timestamp will be different
    await new Promise((resolve) => setTimeout(resolve, 100))

    await heartbeatWorkerSlot({
      workerId: TEST_WORKER_IDS[0],
      role: 'registryManager',
    })

    const afterUpdate = await getWorkerSlotEntry({
      workerId: TEST_WORKER_IDS[0],
      role: 'registryManager',
    })
    expect(afterUpdate?.entry).not.toBeNull()
    const afterHeartbeat = afterUpdate!.entry.lastHeartbeat!

    expect(new Date(afterHeartbeat).getTime()).toBeGreaterThan(new Date(beforeHeartbeat!).getTime())
  })

  test('should signup another worker', async () => {
    const signedUpTypes = await signupWorker({
      workerId: TEST_WORKER_IDS[1],
    })

    expect(signedUpTypes.length).toBeGreaterThan(0)
    const entries = await getWorkerSlots({ workerId: TEST_WORKER_IDS[1] })
    expect(entries.length).toBe(signedUpTypes.length)

    entries.forEach((entry) => {
      expect(entry.workerId).toBe(TEST_WORKER_IDS[1])
      expect(signedUpTypes).toContain(entry.role)
    })
  })

  test('should signup 10 workers', async () => {
    const signups = await Promise.all(
      Array.from({ length: 10 }, (_, i) => TEST_WORKER_IDS[i]).map(async (workerId) => {
        return {
          workerId,
          roles: await signupWorker({ workerId }),
        }
      }),
    )

    const allWorkerTypes = signups.flatMap((signup) => signup.roles)

    expect(allWorkerTypes.filter((type) => type === 'registryManager').length).toBe(2) // First worker should get the registry manager slot

    for (let i = 2; i < signups.length; i++) {
      const { roles } = signups[i]
      expect(roles.length).toBeGreaterThan(0)
      expect(roles).toContain('requestFulfillment') // All subsequent workers should get the model call responder slot
      expect(roles).not.toContain('workspaceConfigManager') // No subsequent workers should get the workspace manager slot
    }
  })

  test('should get all worker registry entries', async () => {
    const allEntries = await Promise.all(
      Array.from({ length: 10 }, async (_, i) => await getWorkerSlots({ workerId: TEST_WORKER_IDS[i] })),
    ).then((results) => results.flat())

    const registryManagers = allEntries.filter((entry) => entry.role === 'registryManager')
    const documentProcessors = allEntries.filter((entry) => entry.role === 'workspaceProcessing')
    const modelCallResponders = allEntries.filter((entry) => entry.role === 'requestFulfillment')

    expect(registryManagers.length).toBeGreaterThanOrEqual(1)
    expect(registryManagers.length).toBeLessThanOrEqual(2) // Because we only allow 2 max

    expect(documentProcessors.length).toBeGreaterThanOrEqual(10)
    expect(modelCallResponders.length).toBeGreaterThanOrEqual(10)
  })

  test('should delete worker', async () => {
    await deleteWorkerSlots(TEST_WORKER_IDS[1])

    const retrievedEntries = await getWorkerSlots({
      workerId: TEST_WORKER_IDS[1],
    })

    expect(retrievedEntries.length).toBe(0)
  })

  test('should signup for registry management as replacement for the deleted worker', async () => {
    const entriesBefore = await getWorkerSlots({
      workerId: TEST_WORKER_IDS[4],
    })

    const workerTypesBefore = entriesBefore.map((entry) => entry.role)
    expect(workerTypesBefore).not.toContain('registryManager') // Should not have the host manager slot before signup
    expect(workerTypesBefore).toContain('requestFulfillment') // Should have the model call responder slot before signup

    const signedUpTypes = await signupWorker({
      workerId: TEST_WORKER_IDS[4],
    })

    expect(signedUpTypes).toContain('registryManager') // Should have the host manager slot after signup
    const entriesAfter = await getWorkerSlots({
      workerId: TEST_WORKER_IDS[4],
    })
    const workerTypesAfter = entriesAfter.map((entry) => entry.role)
    expect(workerTypesAfter.length).toBeGreaterThan(workerTypesBefore.length) // Should have more slots after signup
    expect(workerTypesAfter).toContain('registryManager') // Should have the host manager slot after signup
    expect(workerTypesAfter).toContain('requestFulfillment') // Should not have the model call responder slot after signup because it should have been replaced

    expect(new Set(workerTypesAfter).size).toBe(workerTypesAfter.length) // Ensure no duplicates
  })

  test('should not register a worker if already registered', async () => {
    const entriesBefore = await getWorkerSlots({
      workerId: TEST_WORKER_IDS[4],
    })

    const signedUpTypes = await signupWorker({
      workerId: TEST_WORKER_IDS[4],
    })

    const entriesAfter = await getWorkerSlots({
      workerId: TEST_WORKER_IDS[4],
    })

    expect(entriesAfter.length).toBe(entriesBefore.length) // Should not create new entries
    expect(signedUpTypes.length).toBe(entriesBefore.length) // Should return the same number of worker types
    expect(signedUpTypes.sort()).toEqual(entriesBefore.map((entry) => entry.role).sort()) // Should return the same worker types
  })

  test('Should delete  registryManager s and check the available slots', async () => {
    const allEntriesBefore = await Promise.all(
      Array.from({ length: 10 }, async (_, i) => await getWorkerSlots({ workerId: TEST_WORKER_IDS[i] })),
    ).then((results) => results.flat())

    const registryManagersBefore = allEntriesBefore.filter((entry) => entry.role === 'registryManager')

    expect(registryManagersBefore.length).toBeGreaterThanOrEqual(1)

    await Promise.all([...registryManagersBefore.map((entry) => deleteWorkerSlots(entry.workerId))])

    const stats = await workerSlotStats()

    expect(stats['registryManager'].current).toBe(0)
  })

  test('should mass signup for all available slots', async () => {
    await Promise.all(
      Array.from({ length: 20 }, (_, i) => TEST_WORKER_IDS[i + 10]).map(async (workerId) => {
        return {
          workerId,
          workerTypes: await signupWorker({ workerId }),
        }
      }),
    )
    const allEntries = await Promise.all(
      TEST_WORKER_IDS.map(async (workerId) => await getWorkerSlots({ workerId })),
    ).then((results) => results.flat())

    const registryManager = allEntries.filter((entry) => entry.role === 'registryManager')
    const modelCallResponders = allEntries.filter((entry) => entry.role === 'requestFulfillment')
    const documentProcessors = allEntries.filter((entry) => entry.role === 'workspaceProcessing')

    expect(registryManager.length).toBe(2) // Should only have 2 registry managers

    expect(modelCallResponders.length).toBeGreaterThanOrEqual(20) // Should have at least 20 model call responders
    expect(documentProcessors.length).toBeGreaterThanOrEqual(20) // Should have at least 20 document processors
  })
})

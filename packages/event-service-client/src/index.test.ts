import { initializeEventServiceClient } from './index'

describe('should initialize all streams and registries', () => {
  test('should register new AI_HEALTH_MANAGEMENT worker', async () => {
    const initializeResult = await initializeEventServiceClient()

    expect(initializeResult).toBeDefined()
  })
})

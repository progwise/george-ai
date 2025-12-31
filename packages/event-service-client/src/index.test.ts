import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { type EventClient, createEventClient } from './index'

describe('Event Service Client', () => {
  let client: EventClient
  const testId = Date.now().toString()
  const streams: string[] = []

  beforeAll(async () => {
    client = await createEventClient()
  })

  afterAll(async () => {
    // Cleanup all test streams
    for (const streamName of streams) {
      await client.deleteStream(streamName).catch(() => {
        // Ignore errors if stream already deleted
      })
    }

    if (client) {
      await client.disconnect()
    }
  })

  it('should connect to NATS', async () => {
    expect(await client.isConnected()).toBe(true)
  })

  it('should create a persistent stream', async () => {
    const streamName = `test-persistent-${testId}`
    streams.push(streamName)

    await client.ensureStream({
      streamName,
      subjects: [`test.${testId}.persistent.>`],
      description: 'Test persistent stream',
      persist: true,
    })

    // Should not throw when called again (idempotent)
    await client.ensureStream({
      streamName,
      subjects: [`test.${testId}.persistent.>`],
      description: 'Test persistent stream',
      persist: true,
    })
  })

  it('should create a transient stream', async () => {
    const streamName = `test-transient-${testId}`
    streams.push(streamName)

    await client.ensureStream({
      streamName,
      subjects: [`test.${testId}.transient.>`],
      persist: false,
    })
  })

  it('should publish and subscribe to events', async () => {
    const streamName = `test-pubsub-${testId}`
    const subject = `test.${testId}.pubsub.event`
    const receivedMessages: string[] = []
    streams.push(streamName)

    // Ensure stream exists
    await client.ensureStream({
      streamName,
      subjects: [`test.${testId}.pubsub.>`],
      persist: false,
    })

    // Subscribe (unique subscription name)
    const cleanup = await client.subscribe({
      subscriptionName: `test-pubsub-subscriber-${testId}`,
      streamName,
      subjectFilter: subject,
      handler: async (payload) => {
        const message = new TextDecoder().decode(payload)
        receivedMessages.push(message)
      },
    })

    // Give subscriber time to initialize
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Publish events
    const event1 = { message: 'Hello' }
    const event2 = { message: 'World' }

    await client.publish({
      subject,
      payload: new TextEncoder().encode(JSON.stringify(event1)),
    })

    await client.publish({
      subject,
      payload: new TextEncoder().encode(JSON.stringify(event2)),
    })

    // Wait for messages to be processed
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Verify
    expect(receivedMessages).toHaveLength(2)
    expect(JSON.parse(receivedMessages[0])).toEqual(event1)
    expect(JSON.parse(receivedMessages[1])).toEqual(event2)

    // Cleanup
    await cleanup()
  })

  it('should handle request/reply pattern', async () => {
    const subject = `test.${testId}.math.add`

    // Setup responder
    const cleanupRespond = await client.respond({
      subject,
      handler: async (requestPayload) => {
        const request = JSON.parse(new TextDecoder().decode(requestPayload))
        const result = request.a + request.b
        return new TextEncoder().encode(JSON.stringify({ result }))
      },
    })

    // Give responder time to initialize
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Make request
    const requestPayload = new TextEncoder().encode(JSON.stringify({ a: 5, b: 3 }))
    const responsePayload = await client.request({
      subject,
      payload: requestPayload,
      timeoutMs: 5000,
    })

    const response = JSON.parse(new TextDecoder().decode(responsePayload))
    expect(response.result).toBe(8)

    // Cleanup
    await cleanupRespond()
  })

  it('should handle multiple independent subscribers (unique names)', async () => {
    const streamName = `test-independent-${testId}`
    const subject = `test.${testId}.independent`
    const consumer1Messages: string[] = []
    const consumer2Messages: string[] = []
    streams.push(streamName)

    await client.ensureStream({
      streamName,
      subjects: [`test.${testId}.independent`],
      persist: true,
    })

    // Two subscribers with DIFFERENT names = independent (both receive all messages)
    const cleanup1 = await client.subscribe({
      subscriptionName: `independent-consumer1-${testId}`,
      streamName,
      subjectFilter: subject,
      handler: async (payload) => {
        const message = new TextDecoder().decode(payload)
        consumer1Messages.push(message)
      },
    })

    const cleanup2 = await client.subscribe({
      subscriptionName: `independent-consumer2-${testId}`,
      streamName,
      subjectFilter: subject,
      handler: async (payload) => {
        const message = new TextDecoder().decode(payload)
        consumer2Messages.push(message)
      },
    })

    await new Promise((resolve) => setTimeout(resolve, 100))

    // Publish 10 events
    for (let i = 0; i < 10; i++) {
      await client.publish({
        subject,
        payload: new TextEncoder().encode(JSON.stringify({ index: i })),
      })
    }

    await new Promise((resolve) => setTimeout(resolve, 500))

    // Both consumers receive ALL messages (independent subscribers)
    expect(consumer1Messages.length).toBe(10)
    expect(consumer2Messages.length).toBe(10)

    await cleanup1()
    await cleanup2()
  })

  it('should handle consumer groups (shared subscription name)', async () => {
    const streamName = `test-consumer-group-${testId}`
    const subject = `test.${testId}.group`
    const worker1Messages: string[] = []
    const worker2Messages: string[] = []
    streams.push(streamName)

    await client.ensureStream({
      streamName,
      subjects: [`test.${testId}.group`],
      persist: true,
    })

    // Two workers with SAME subscription name = consumer group (load balanced)
    const sharedGroupName = `test-workers-${testId}`

    const cleanup1 = await client.subscribe({
      subscriptionName: sharedGroupName, // ← Same name!
      streamName,
      subjectFilter: subject,
      handler: async (payload) => {
        const message = new TextDecoder().decode(payload)
        worker1Messages.push(message)
      },
    })

    const cleanup2 = await client.subscribe({
      subscriptionName: sharedGroupName, // ← Same name!
      streamName,
      subjectFilter: subject,
      handler: async (payload) => {
        const message = new TextDecoder().decode(payload)
        worker2Messages.push(message)
      },
    })

    await new Promise((resolve) => setTimeout(resolve, 100))

    // Publish 10 events
    for (let i = 0; i < 10; i++) {
      await client.publish({
        subject,
        payload: new TextEncoder().encode(JSON.stringify({ index: i })),
      })
    }

    await new Promise((resolve) => setTimeout(resolve, 500))

    // Messages distributed between workers (consumer group = load balanced)
    const totalReceived = worker1Messages.length + worker2Messages.length
    expect(totalReceived).toBe(10)
    expect(worker1Messages.length).toBeGreaterThan(0)
    expect(worker2Messages.length).toBeGreaterThan(0)

    await cleanup1()
    await cleanup2()
  })

  it('should delete streams', async () => {
    const streamName = `test-delete-${testId}`

    await client.ensureStream({
      streamName,
      subjects: [`test.${testId}.delete.>`],
      persist: false,
    })

    // Delete stream
    await client.deleteStream(streamName)

    // Verify stream is gone by trying to subscribe (should fail)
    await expect(
      client.subscribe({
        subscriptionName: 'test-deleted-stream-subscriber',
        streamName,
        subjectFilter: `test.${testId}.delete.>`,
        handler: async () => {},
      }),
    ).rejects.toThrow('Stream does not exist')
  })

  it('should disconnect gracefully', async () => {
    const tempClient = await createEventClient()

    expect(await tempClient.isConnected()).toBe(true)

    await tempClient.disconnect()

    expect(await tempClient.isConnected()).toBe(false)
  })

  it('should handle publish with custom timeout', async () => {
    const streamName = `test-timeout-${testId}`
    const subject = `test.${testId}.timeout.event`
    streams.push(streamName)

    await client.ensureStream({
      streamName,
      subjects: [`test.${testId}.timeout.>`],
      persist: false,
    })

    const ack = await client.publish({
      subject,
      payload: new TextEncoder().encode(JSON.stringify({ data: 'test' })),
      timeoutMs: 1000,
    })

    expect(ack.streamName).toBe(streamName)
    expect(ack.msgId).toBeDefined()
  })

  it('should throw error when stream does not exist for subscribe', async () => {
    await expect(
      client.subscribe({
        subscriptionName: 'test-non-existent',
        streamName: 'non-existent-stream',
        subjectFilter: 'test.>',
        handler: async () => {},
      }),
    ).rejects.toThrow('Stream does not exist')
  })

  it('should throw error when persistence mismatch on ensureStream', async () => {
    const streamName = `test-persist-mismatch-${testId}`
    streams.push(streamName)

    // Create with persist: true
    await client.ensureStream({
      streamName,
      subjects: [`test.${testId}.mismatch.>`],
      persist: true,
    })

    // Try to ensure with persist: false (should throw)
    await expect(
      client.ensureStream({
        streamName,
        subjects: [`test.${testId}.mismatch.>`],
        persist: false,
      }),
    ).rejects.toThrow('Cannot change stream persistence after creation')
  })

  it('should update stream subjects when changed', async () => {
    const streamName = `test-update-${testId}`
    streams.push(streamName)

    // Create with initial subjects
    await client.ensureStream({
      streamName,
      subjects: [`test.${testId}.update.a`],
      persist: false,
    })

    // Update subjects (should not throw)
    await client.ensureStream({
      streamName,
      subjects: [`test.${testId}.update.a`, `test.${testId}.update.b`],
      persist: false,
    })

    // Verify we can publish to new subject
    const ack = await client.publish({
      subject: `test.${testId}.update.b`,
      payload: new TextEncoder().encode(JSON.stringify({ test: true })),
    })

    expect(ack.streamName).toBe(streamName)
  })
})

import z from 'zod'

import { eventClient } from '.'

describe.sequential('Bucket Watch Tests', () => {
  const now = Date.now()
  const TEST_KV_BUCKET_NAME = `test-kv-bucket-${now}`
  const TEST_KV_BUCKET_SCHEMA = z.object({
    id: z.string(),
  })

  beforeAll(async () => {
    await eventClient.ensureBucket({ name: TEST_KV_BUCKET_NAME, options: { history: 0 } })
  })

  afterAll(async () => {
    await eventClient.deleteBucket({ name: TEST_KV_BUCKET_NAME })
  })

  it('Should not receive anything if no entries exist', async () => {
    const receivedEntries: Array<{
      revision: number
      key: string
      entry: { id: string } | null
      operation: 'update' | 'delete'
    }> = []
    const cleanup = await eventClient.watchBucket({
      bucketName: TEST_KV_BUCKET_NAME,
      schema: TEST_KV_BUCKET_SCHEMA,
      filter: '>',
      handler: ({ revision, key, entry, operation }) => {
        receivedEntries.push({ revision, key, entry, operation })
        return Promise.resolve()
      },
    })

    await new Promise((resolve) => setTimeout(resolve, 1000))
    await cleanup()
    expect(receivedEntries).toHaveLength(0)
  })

  it('Should receive updates when new entries arrive', async () => {
    const receivedEntries: Array<{
      revision: number
      key: string
      entry: { id: string } | null
      operation: 'update' | 'delete'
    }> = []
    const cleanup = await eventClient.watchBucket({
      bucketName: TEST_KV_BUCKET_NAME,
      schema: TEST_KV_BUCKET_SCHEMA,
      filter: '>',
      handler: ({ revision, key, entry, operation }) => {
        receivedEntries.push({ revision, key, entry, operation })
        return Promise.resolve()
      },
    })

    await eventClient.putBucketEntry({
      bucketName: TEST_KV_BUCKET_NAME,
      key: 'entry1',
      item: { id: 'entry1' },
    })

    await new Promise((resolve) => setTimeout(resolve, 1000))
    await cleanup()

    expect(receivedEntries).toHaveLength(1)
    expect(receivedEntries[0].key).toBe('entry1')
    expect(receivedEntries[0].entry).toEqual({ id: 'entry1' })
    expect(receivedEntries[0].operation).toBe('update')
  })

  it('Should receive entry when items are inside the bucket before watching', async () => {
    const receivedEntries: Array<{
      revision: number
      key: string
      entry: { id: string } | null
      operation: 'update' | 'delete'
    }> = []

    const cleanup = await eventClient.watchBucket({
      bucketName: TEST_KV_BUCKET_NAME,
      schema: TEST_KV_BUCKET_SCHEMA,
      filter: '>',
      handler: ({ revision, key, entry, operation }) => {
        receivedEntries.push({ revision, key, entry, operation })
        return Promise.resolve()
      },
    })

    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (receivedEntries.length > 0) {
          clearInterval(interval)
          resolve(undefined)
        }
      }, 100)
    })

    await cleanup()

    expect(receivedEntries).toHaveLength(1)
    expect(receivedEntries[0].key).toBe('entry1')
    expect(receivedEntries[0].entry).toEqual({ id: 'entry1' })
    expect(receivedEntries[0].operation).toBe('update')
  })

  it('Should receive 3 items when 2 more are added', async () => {
    await eventClient.putBucketEntry({
      bucketName: TEST_KV_BUCKET_NAME,
      key: 'entry2',
      item: { id: 'entry2' },
    })

    const receivedEntries: Array<{
      revision: number
      key: string
      entry: { id: string } | null
      operation: 'update' | 'delete'
    }> = []

    const cleanup = await eventClient.watchBucket({
      bucketName: TEST_KV_BUCKET_NAME,
      schema: TEST_KV_BUCKET_SCHEMA,
      filter: '>',
      handler: ({ revision, key, entry, operation }) => {
        receivedEntries.push({ revision, key, entry, operation })
        return Promise.resolve()
      },
    })

    await eventClient.putBucketEntry({
      bucketName: TEST_KV_BUCKET_NAME,
      key: 'entry3',
      item: { id: 'entry3' },
    })

    await new Promise((resolve) => setTimeout(resolve, 1000))
    await cleanup()

    expect(receivedEntries).toHaveLength(3)

    expect(receivedEntries[0].key).toBe('entry1')
    expect(receivedEntries[0].entry).toEqual({ id: 'entry1' })
    expect(receivedEntries[0].operation).toBe('update')

    expect(receivedEntries[1].key).toBe('entry2')
    expect(receivedEntries[1].entry).toEqual({ id: 'entry2' })
    expect(receivedEntries[1].operation).toBe('update')

    expect(receivedEntries[2].key).toBe('entry3')
    expect(receivedEntries[2].entry).toEqual({ id: 'entry3' })
    expect(receivedEntries[2].operation).toBe('update')
  })

  it('Should receive delete operations', async () => {
    const receivedEntries: Array<{
      revision: number
      key: string
      entry: { id: string } | null
      operation: 'update' | 'delete'
    }> = []

    const cleanup = await eventClient.watchBucket({
      bucketName: TEST_KV_BUCKET_NAME,
      schema: TEST_KV_BUCKET_SCHEMA,
      filter: 'entry1',
      handler: ({ revision, key, entry, operation }) => {
        receivedEntries.push({ revision, key, entry, operation })
        return Promise.resolve()
      },
    })

    await eventClient.deleteBucketEntry({
      bucketName: TEST_KV_BUCKET_NAME,
      key: 'entry1',
    })

    await new Promise((resolve) => setTimeout(resolve, 1000))
    await cleanup()

    expect(receivedEntries).toHaveLength(2)
    expect(receivedEntries[0].key).toBe('entry1')
    expect(receivedEntries[0].entry).toEqual({ id: 'entry1' })
    expect(receivedEntries[1].key).toBe('entry1')
    expect(receivedEntries[1].entry).toBeNull()
    expect(receivedEntries[1].operation).toBe('delete')
  })

  it('Should not receive items that have been deleted before watching', async () => {
    const receivedEntries: Array<{
      revision: number
      key: string
      entry: { id: string } | null
      operation: 'update' | 'delete'
    }> = []

    const cleanup = await eventClient.watchBucket({
      bucketName: TEST_KV_BUCKET_NAME,
      schema: TEST_KV_BUCKET_SCHEMA,
      filter: '>',
      handler: ({ revision, key, entry, operation }) => {
        receivedEntries.push({ revision, key, entry, operation })
        return Promise.resolve()
      },
    })

    await new Promise((resolve) => setTimeout(resolve, 1000))
    await cleanup()

    expect(receivedEntries).toHaveLength(2)
    expect(receivedEntries[0].key).toBe('entry2')
    expect(receivedEntries[0].entry).toEqual({ id: 'entry2' })
    expect(receivedEntries[0].operation).toBe('update')

    expect(receivedEntries[1].key).toBe('entry3')
    expect(receivedEntries[1].entry).toEqual({ id: 'entry3' })
    expect(receivedEntries[1].operation).toBe('update')
  })
})

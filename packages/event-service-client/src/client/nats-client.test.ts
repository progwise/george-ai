import z from 'zod'

import { eventClient } from '.'

describe('Nats Client base tests', () => {
  it('try out the subject matcher', () => {
    const result1 = eventClient.matchesSubjectFilter({ subject: 'kfz.motorrad.bmw.enduro.gs1200', filter: '>' })
    expect(result1).toBeTruthy()
    const result2 = eventClient.matchesSubjectFilter({ subject: 'kfz.motorrad.bmw.enduro.gs1200', filter: 'kfz.>' })
    expect(result2).toBeTruthy()
    const result3 = eventClient.matchesSubjectFilter({
      subject: 'kfz.motorrad.bmw.enduro.gs1200',
      filter: 'kfz.*.audi.>',
    })
    expect(result3).toBeFalsy()
  })

  it('try out the subject matcher with shorter filter', () => {
    const result = eventClient.matchesSubjectFilter({ subject: 'a.b.c', filter: 'a.b' })

    expect(result).toBeFalsy()
  })

  const now = Date.now()

  describe.sequential('Bucket tests', () => {
    const bucketName = `TestBucket-${now}`

    const testSchema = z.object({
      id: z.string(),
      value: z.string().optional(),
    })

    const testItem = testSchema.parse({ id: '12', value: 'Huhu ein Uhu' })

    beforeAll(async () => {
      await eventClient.ensureBucket({ name: bucketName })
    })

    afterAll(async () => {
      await eventClient.deleteBucket({ name: bucketName })
    })

    it('should return empty array if no entries exist', async () => {
      const entries = await eventClient.getBucketEntries({ schema: testSchema, bucketName, filter: '>' })
      expect(entries).toBeDefined()
      expect(entries.length).toBe(0)
    })

    it('should return without error if trying to delete bucket entries that do not exist', async () => {
      await eventClient.deleteBucketEntries({ bucketName, filter: '>' })
    })

    it('Should store entry', async () => {
      await eventClient.putBucketEntry({ bucketName, key: 'eins.zwei.3', item: testItem })
    })

    it('should find the entry', async () => {
      const entries = await eventClient.getBucketEntries({ schema: testSchema, bucketName, filter: '>' })
      expect(entries.length).toBe(1)
      expect(entries[0].value).toEqual(testItem)
    })

    it('should find all keys', async () => {
      const keys = await eventClient.getBucketKeys({ bucketName, filter: '>' })
      expect(keys.length).toBe(1)
      expect(keys[0]).toBe('eins.zwei.3')
    })

    it('should find the key with wildcard', async () => {
      const keys = await eventClient.getBucketKeys({ bucketName, filter: 'eins.*.3' })
      expect(keys.length).toBe(1)
      expect(keys[0]).toBe('eins.zwei.3')
    })

    it('should find the entry with wildcard', async () => {
      const entries = await eventClient.getBucketEntries({ schema: testSchema, bucketName, filter: 'eins.*.3' })
      expect(entries.length).toBe(1)
      expect(entries[0].key).toBe('eins.zwei.3')
      expect(entries[0].value).toEqual(testItem)
    })

    it('should generate 1000 entries', async () => {
      await Promise.all(
        Array.from({ length: 1000 }).map(async (_, i) => {
          const key = `mass.${i}.drei`
          const item = testSchema.parse({
            id: String(1000 + i),
            value: `Das ist mal wieder ein value heute ${i}`,
          })

          await eventClient.putBucketEntry({ bucketName, key, item })
        }),
      )

      const keys = await eventClient.getBucketKeys({ bucketName, filter: 'mass.*.drei' })

      expect(keys.length).toBe(1000)
    })

    it('should delete 100 entries', async () => {
      await Promise.all(
        Array.from({ length: 100 }).map(
          async (_, index) => await eventClient.deleteBucketEntry({ bucketName, key: `mass.${index}.drei` }),
        ),
      )

      const keys = await eventClient.getBucketKeys({ bucketName, filter: 'mass.*.drei' })
      expect(keys.length).toBe(900)
    })

    it('should delete all remaining entries', async () => {
      await eventClient.deleteBucketEntries({ bucketName, filter: '>' })

      const keys = await eventClient.getBucketKeys({ bucketName, filter: '>' })
      expect(keys.length).toBe(0)
    }, 30000)
  })

  describe.sequential('stream tests', () => {
    const TEST_STREAM_NAME = `test-stream-${now}`

    const TEST_SUBJECT_PREFIX = `test.${now}`

    afterAll(async () => {
      await eventClient.deleteStream(TEST_STREAM_NAME)
    })

    it('should create the stream', async () => {
      await eventClient.ensureWorkerStream({ streamName: TEST_STREAM_NAME, subjects: [`${TEST_SUBJECT_PREFIX}.>`] })
    })

    it('should get stats', async () => {
      const stats = await eventClient.getStreamStatistics({
        streamName: TEST_STREAM_NAME,
        subjectFilter: `${TEST_SUBJECT_PREFIX}.>`,
      })
      expect(stats.totalMessages).toBe(0)
    })

    it('should post 100 messages', async () => {
      const exampleEvent = {
        index: 0,
        message: 'hellas',
      }
      await Promise.all(
        Array.from({ length: 100 }).map(async (_, index) => {
          await eventClient.publish({
            subject: `${TEST_SUBJECT_PREFIX}.group.${index % 4}.item.${1000 + index}`,
            event: { ...exampleEvent, index: index, message: `Why not Number ${index}?` },
          })
        }),
      )
    })

    it('should show the messages in the stats now', async () => {
      const stats = await eventClient.getStreamStatistics({
        streamName: TEST_STREAM_NAME,
        subjectFilter: `${TEST_SUBJECT_PREFIX}.group.3.>`,
      })
      expect(stats.totalMessages).toBe(100)
      expect(stats.filteredMessages).toBe(25)
    })

    it('Should get 50 messages', async () => {
      const schema = z.object({ index: z.number(), message: z.string() })
      const messagesResult = await eventClient.getMessages({
        schema,
        streamName: TEST_STREAM_NAME,
        subjectFilters: [`${TEST_SUBJECT_PREFIX}.group.2.>`],
        take: 7,
      })

      expect(messagesResult).toBeDefined()
      expect(messagesResult.messages.length).toBe(7)
      for (const message of messagesResult.messages) {
        expect(message.subject.startsWith(`${TEST_SUBJECT_PREFIX}.group.2.`)).toBeTruthy()
      }
    })
  })
})

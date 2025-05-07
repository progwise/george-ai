import { upsertCronJob } from '../../cron-jobs'
import { prisma } from '../../prisma'
import { executeGraphQL, graphql } from '../../testing/execute-graphql'

const libraryId = 'library-id'

vi.mock(
  import('../../cron-jobs'),
  async () =>
    ({
      upsertCronJob: vi.fn(),
      stopCronJob: vi.fn(),
    }) satisfies typeof import('../../cron-jobs'),
)

const mutation = graphql(`
  mutation updateAiLibraryCrawler($cronJob: AiLibraryCrawlerCronJobInput) {
    updateAiLibraryCrawler(
      id: "crawler-id"
      data: { maxDepth: 1, maxPages: 1, url: "https://example.com", libraryId: "library-id", cronJob: $cronJob }
    ) {
      id
    }
  }
`)

describe('updateAiLibraryCrawler mutation', () => {
  beforeEach(async () => {
    await prisma.aiLibrary.create({
      data: {
        id: libraryId,
        name: 'George AI',
        owner: {
          create: {
            name: 'Test User',
            email: 'test@george-ai.net',
            username: 'geroge',
          },
        },
      },
    })
  })

  it('throws error when crawler does not exist', async () => {
    const result = await executeGraphQL(mutation)

    expect(result.errors).toHaveLength(1)
    expect(result.errors?.[0].message).toBe('Crawler not found')

    expect(result.data?.updateAiLibraryCrawler).toBeNull()
  })

  it('updates crawler', async () => {
    await prisma.aiLibraryCrawler.create({
      data: {
        id: 'crawler-id',
        url: 'https://progwise.net',
        maxDepth: 0,
        maxPages: 0,
        libraryId,
      },
    })

    const result = await executeGraphQL(mutation)
    expect(result.errors).toBeUndefined()
    expect(result.data?.updateAiLibraryCrawler).toEqual({ id: 'crawler-id' })

    const updatedCrawler = await prisma.aiLibraryCrawler.findUniqueOrThrow({ where: { id: 'crawler-id' } })

    expect(updatedCrawler).toEqual({
      id: 'crawler-id',
      url: 'https://example.com',
      maxDepth: 1,
      maxPages: 1,
      libraryId: 'library-id',
      lastRun: null,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    })
  })

  describe('cronjob', () => {
    it('updates crawler cron job', async () => {
      await prisma.aiLibraryCrawler.create({
        data: {
          id: 'crawler-id',
          url: 'https://progwise.net',
          maxDepth: 0,
          maxPages: 0,
          libraryId,
          cronJob: {
            create: {
              id: 'cron-job-id',
              active: false,
              hour: 0,
              minute: 0,
              monday: false,
              tuesday: false,
              wednesday: false,
              thursday: false,
              friday: false,
              saturday: false,
              sunday: false,
            },
          },
        },
      })

      const result = await executeGraphQL(mutation, {
        variables: {
          cronJob: {
            active: true,
            hour: 1,
            minute: 1,
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: true,
            sunday: true,
          },
        },
      })

      expect(result.errors).toBeUndefined()
      expect(result.data?.updateAiLibraryCrawler).toEqual({ id: 'crawler-id' })
      expect(upsertCronJob).toHaveBeenCalledExactlyOnceWith({
        id: 'cron-job-id',
        crawlerId: 'crawler-id',
        active: true,
        hour: 1,
        minute: 1,
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })

      const updatedCronJob = await prisma.aiLibraryCrawlerCronJob.findUniqueOrThrow({
        where: { id: 'cron-job-id' },
      })
      expect(updatedCronJob).toEqual({
        id: 'cron-job-id',
        crawlerId: 'crawler-id',
        active: true,
        hour: 1,
        minute: 1,
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
    })

    it('creates crawler cron job', async () => {
      await prisma.aiLibraryCrawler.create({
        data: {
          id: 'crawler-id',
          url: 'https://progwise.net',
          maxDepth: 0,
          maxPages: 0,
          libraryId,
        },
      })

      const result = await executeGraphQL(mutation, {
        variables: {
          cronJob: {
            active: true,
            hour: 1,
            minute: 1,
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: true,
            sunday: true,
          },
        },
      })

      expect(result.errors).toBeUndefined()
      expect(result.data?.updateAiLibraryCrawler).toEqual({ id: 'crawler-id' })
      expect(upsertCronJob).toHaveBeenCalledExactlyOnceWith({
        id: expect.any(String),
        crawlerId: 'crawler-id',
        active: true,
        hour: 1,
        minute: 1,
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })

      const updatedCronJob = await prisma.aiLibraryCrawlerCronJob.findUniqueOrThrow({
        where: { crawlerId: 'crawler-id' },
      })
      expect(updatedCronJob).toEqual({
        id: expect.any(String),
        crawlerId: 'crawler-id',
        active: true,
        hour: 1,
        minute: 1,
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
    })

    it('sets cron job to inactive when not provided', async () => {
      await prisma.aiLibraryCrawler.create({
        data: {
          id: 'crawler-id',
          url: 'https://progwise.net',
          maxDepth: 0,
          maxPages: 0,
          libraryId,
          cronJob: {
            create: {
              id: 'cron-job-id',
              active: true,
              hour: 1,
              minute: 1,
              monday: true,
              tuesday: true,
              wednesday: true,
              thursday: true,
              friday: true,
              saturday: true,
              sunday: true,
            },
          },
        },
      })

      const result = await executeGraphQL(mutation)

      expect(result.errors).toBeUndefined()
      expect(result.data?.updateAiLibraryCrawler).toEqual({ id: 'crawler-id' })
      expect(upsertCronJob).toHaveBeenCalledExactlyOnceWith({
        id: 'cron-job-id',
        crawlerId: 'crawler-id',
        active: false,
        hour: 1,
        minute: 1,
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })

      const updatedCronJob = await prisma.aiLibraryCrawlerCronJob.findUniqueOrThrow({
        where: { id: 'cron-job-id' },
      })
      expect(updatedCronJob).toEqual({
        id: 'cron-job-id',
        crawlerId: 'crawler-id',
        active: false,
        hour: 1,
        minute: 1,
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
    })
  })
})

import { upsertCronJob } from '../../cron-jobs'
import { prisma } from '../../prisma'
import { AiLibraryCrawlerCronJobInput } from '../ai-library-crawler-cronjob'
import { builder } from '../builder'

builder.mutationField('updateAiLibraryCrawler', (t) =>
  t.prismaField({
    type: 'AiLibraryCrawler',
    args: {
      id: t.arg.string(),
      url: t.arg.string(),
      maxDepth: t.arg.int(),
      maxPages: t.arg.int(),
      libraryId: t.arg.string(),
      cronJob: t.arg({ type: AiLibraryCrawlerCronJobInput, required: false }),
    },
    resolve: async (_query, _source, { id, cronJob, ...data }) => {
      const crawler = await prisma.aiLibraryCrawler.update({
        where: { id },
        data: {
          ...data,
          cronJob: cronJob
            ? {
                update: { ...cronJob },
              }
            : undefined,
        },
        include: { cronJob: true },
      })

      if (crawler.cronJob) {
        await upsertCronJob(crawler.cronJob)
      }

      return crawler
    },
  }),
)

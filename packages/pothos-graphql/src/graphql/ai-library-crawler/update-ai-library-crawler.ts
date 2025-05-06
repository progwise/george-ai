import { GraphQLError } from 'graphql'

import { upsertCronJob } from '../../cron-jobs'
import { prisma } from '../../prisma'
import { builder } from '../builder'
import { AiLibraryCrawlerInput } from './index'

builder.mutationField('updateAiLibraryCrawler', (t) =>
  t.prismaField({
    type: 'AiLibraryCrawler',
    args: {
      id: t.arg.string({ required: true }),
      input: t.arg({ type: AiLibraryCrawlerInput }),
    },
    resolve: async (_query, _source, { id, input }) => {
      const { cronJob, ...data } = input
      const existingCrawler = await prisma.aiLibraryCrawler.findUnique({
        where: { id },
        include: { cronJob: true },
      })

      if (!existingCrawler) {
        throw new GraphQLError(`Crawler not found`)
      }

      const crawler = await prisma.aiLibraryCrawler.update({
        where: { id },
        data: {
          ...data,
          cronJob: existingCrawler.cronJob
            ? { update: cronJob ?? { active: false } }
            : { create: cronJob ?? undefined },
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

import { CronJob } from 'cron'

import { AiLibraryCrawlerCronJob } from '@george-ai/prismaClient'

import { getCronExpression } from './graphql/ai-library-crawler-cronjob/get-cron-expression'
import { runCrawler } from './graphql/ai-library-crawler/run-crawler'
import { prisma } from './prisma'

const cronJobByIds = new Map<string, CronJob<() => void, null>>()

const restoreCronJobsFromDatabase = async () => {
  console.log('Restore cron jobs from database')
  const activeCronJobs = await prisma.aiLibraryCrawlerCronJob.findMany({ where: { active: true } })

  for (const cronJob of activeCronJobs) {
    await addCronJob(cronJob)
  }
}

export const addCronJob = async (cronJob: AiLibraryCrawlerCronJob) => {
  await stopCronJob(cronJob)

  if (!cronJob.active) {
    return
  }

  const cronExpression = getCronExpression(cronJob)
  if (!cronExpression) {
    return
  }

  const job = new CronJob(
    cronExpression,
    async () => {
      try {
        console.log('Running cron job', cronJob.id)
        await runCrawler({ crawlerId: cronJob.crawlerId, runByCronJob: true })
      } catch (error) {
        console.log('Error running cron job', cronJob.id, error)
      }
    },
    () => {
      console.log('Cron job completed', cronJob.id)
    },
    true, // start the job right now
  )

  cronJobByIds.set(cronJob.id, job)
}

const stopCronJob = async (cronJob: AiLibraryCrawlerCronJob) => {
  const job = cronJobByIds.get(cronJob.id)

  if (job) {
    await job.stop()
    cronJobByIds.delete(cronJob.id)
  }
}

// After the server starts, restore all cron jobs from the database
restoreCronJobsFromDatabase()

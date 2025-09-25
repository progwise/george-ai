import { CronJob } from 'cron'

import { AiLibraryCrawlerCronJob } from '../../../prisma/generated/client'

import { getCronExpression } from '../../graphql/ai-library-crawler-cronjob/get-cron-expression'
import { prisma } from '../../prisma'
import { runCrawler } from './crawler-run'

const cronJobByIds = new Map<string, CronJob<() => void, null>>()

const restoreCronJobsFromDatabase = async () => {
  console.log('Restore cron jobs from database')
  const activeCronJobs = await prisma.aiLibraryCrawlerCronJob.findMany({ where: { active: true } })

  for (const cronJob of activeCronJobs) {
    await upsertCronJob(cronJob)
  }
}

/**
 * Adds a cron job to the cron job manager.
 * If the cron job is already running, it will be stopped first.
 * If the cron job is not active, it will not be added.
 */
export const upsertCronJob = async (cronJob: AiLibraryCrawlerCronJob) => {
  await stopCronJob(cronJob)

  const cronExpression = getCronExpression(cronJob)
  if (!cronExpression) {
    return
  }

  const job = new CronJob(
    cronExpression,
    async () => {
      try {
        console.log('Running cron job', cronJob.id)
        // TODO: specify how to run the cron job as a specific user
        await runCrawler({ crawlerId: cronJob.crawlerId, runByCronJob: true, userId: 'cronJob' })
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

export const stopCronJob = async (cronJob: AiLibraryCrawlerCronJob) => {
  const job = cronJobByIds.get(cronJob.id)

  if (job) {
    await job.stop()
    cronJobByIds.delete(cronJob.id)
  }
}

// After the server starts, restore all cron jobs from the database
restoreCronJobsFromDatabase()

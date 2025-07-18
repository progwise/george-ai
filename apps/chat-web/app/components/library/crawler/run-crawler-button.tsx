import { useMutation } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { twMerge } from 'tailwind-merge'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { RunCrawlerButton_CrawlerFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { PlayIcon } from '../../../icons/play-icon'
import { backendRequest } from '../../../server-functions/backend'
import { toastError, toastSuccess } from '../../georgeToaster'

graphql(`
  fragment RunCrawlerButton_Crawler on AiLibraryCrawler {
    id
    isRunning
  }
`)

interface RunCrawlerButtonProps {
  crawler: RunCrawlerButton_CrawlerFragment
  afterStart?: (crawlerRunId: string | undefined) => void
  afterStop?: (crawlerRunId: string | undefined) => void
  className?: string
}

const runCrawler = createServerFn({ method: 'POST' })
  .validator((data: { crawlerId: string }) =>
    z
      .object({
        crawlerId: z.string().nonempty(),
      })
      .parse(data),
  )
  .handler(async (ctx) => {
    const result = await backendRequest(
      graphql(`
        mutation runCrawler($crawlerId: String!) {
          runAiLibraryCrawler(crawlerId: $crawlerId)
        }
      `),
      { crawlerId: ctx.data.crawlerId },
    )
    return result.runAiLibraryCrawler
  })

const stopCrawler = createServerFn({ method: 'POST' })
  .validator((data: { crawlerId: string }) =>
    z
      .object({
        crawlerId: z.string().nonempty(),
      })
      .parse(data),
  )
  .handler(async (ctx) => {
    const result = await backendRequest(
      graphql(`
        mutation stopCrawler($crawlerId: String!) {
          stopAiLibraryCrawler(crawlerId: $crawlerId)
        }
      `),
      { crawlerId: ctx.data.crawlerId },
    )
    return result.stopAiLibraryCrawler
  })

export const RunCrawlerButton = ({ crawler, className, afterStart, afterStop }: RunCrawlerButtonProps) => {
  const runCrawlerMutation = useMutation({
    mutationFn: () => runCrawler({ data: { crawlerId: crawler.id } }),
    onError: (error) => {
      toastError(error.message || 'Failed starting crawler')
    },
    onSuccess: () => {
      toastSuccess('Crawler started successfully')
    },
    onSettled: (data) => {
      afterStart?.(data)
    },
  })

  const stopCrawlerMutation = useMutation({
    mutationFn: () => stopCrawler({ data: { crawlerId: crawler.id } }),
    onError: (error) => {
      toastError(error.message || 'Failed stop crawler')
    },
    onSuccess: () => {
      toastSuccess('Crawler stopped successfully')
    },
    onSettled: (data) => {
      afterStop?.(data)
    },
  })
  const { t } = useTranslation()

  const handleClick = () => {
    if (!crawler.isRunning) {
      runCrawlerMutation.mutate()
    } else {
      stopCrawlerMutation.mutate()
    }
  }

  return (
    <button
      type="button"
      disabled={runCrawlerMutation.isPending}
      onClick={handleClick}
      className={twMerge('btn btn-primary btn-xs', className)}
    >
      {crawler.isRunning ? <span className="loading loading-spinner loading-xs"></span> : <PlayIcon />}
      {crawler.isRunning ? t('crawlers.stop') : t('crawlers.run')}
    </button>
  )
}

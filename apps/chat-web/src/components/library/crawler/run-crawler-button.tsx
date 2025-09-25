import { useMutation, useQueryClient } from '@tanstack/react-query'
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
    libraryId
    isRunning
  }
`)

interface RunCrawlerButtonProps {
  crawler: RunCrawlerButton_CrawlerFragment
  className?: string
  afterStart?: (crawlerRunId: string) => void
}

const runCrawler = createServerFn({ method: 'POST' })
  .inputValidator((data: { crawlerId: string }) =>
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
  .inputValidator((data: { crawlerId: string }) =>
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

export const RunCrawlerButton = ({ crawler, className, afterStart }: RunCrawlerButtonProps) => {
  const queryClient = useQueryClient()
  const invalidateRelatedQueries = async (crawlerRunId?: string) => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ['getCrawlerRuns', { libraryId: crawler.libraryId, crawlerId: crawler.id }],
        exact: false,
      }),
      queryClient.invalidateQueries({
        queryKey: ['getCrawler', { libraryId: crawler.libraryId, crawlerId: crawler.id }],
      }),
      queryClient.invalidateQueries({
        queryKey: ['getCrawlers', { libraryId: crawler.libraryId }],
      }),
      crawlerRunId &&
        queryClient.invalidateQueries({
          queryKey: ['getCrawlerRun', { libraryId: crawler.libraryId, crawlerRunId }],
        }),
    ])
  }
  const runCrawlerMutation = useMutation({
    mutationFn: () => runCrawler({ data: { crawlerId: crawler.id } }),
    onError: (error) => {
      toastError(error.message || t('crawlers.startFailed'))
    },
    onSuccess: (crawlerRunId) => {
      toastSuccess(t('crawlers.startSuccess'))
      afterStart?.(crawlerRunId)
    },
    onSettled: async (data) => {
      invalidateRelatedQueries(data)
    },
  })

  const stopCrawlerMutation = useMutation({
    mutationFn: () => stopCrawler({ data: { crawlerId: crawler.id } }),
    onError: (error) => {
      toastError(error.message || t('crawlers.stopFailed'))
    },
    onSuccess: () => {
      toastSuccess(t('crawlers.stopSuccess'))
    },
    onSettled: async (data) => {
      invalidateRelatedQueries(data)
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
      className={twMerge('btn btn-primary', className)}
    >
      {crawler.isRunning ? <span className="loading loading-spinner loading-xs"></span> : <PlayIcon />}
      {crawler.isRunning ? t('crawlers.stop') : t('crawlers.run')}
    </button>
  )
}

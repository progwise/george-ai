import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { RunCrawlerButton_CrawlerFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { backendRequest } from '../../../server-functions/backend'
import { toastError, toastSuccess } from '../../georgeToaster'
import { aiLibraryFilesQueryOptions } from '../files/get-files'
import { getCrawlersQueryOptions } from './get-crawlers'

graphql(`
  fragment RunCrawlerButton_Crawler on AiLibraryCrawler {
    id
    isRunning
  }
`)

interface RunCrawlerButtonProps {
  libraryId: string
  crawler: RunCrawlerButton_CrawlerFragment
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
    return await backendRequest(
      graphql(`
        mutation runCrawler($crawlerId: String!) {
          runAiLibraryCrawler(crawlerId: $crawlerId) {
            id
            lastRun {
              startedAt
            }
          }
        }
      `),
      { crawlerId: ctx.data.crawlerId },
    )
  })

export const RunCrawlerButton = ({ libraryId, crawler }: RunCrawlerButtonProps) => {
  const queryClient = useQueryClient()

  const runCrawlerMutation = useMutation({
    mutationFn: async () => {
      return await runCrawler({ data: { crawlerId: crawler.id } })
    },
    onError: (error) => {
      toastError(error.message || 'Failed starting crawler')
    },
    onSuccess: (data) => {
      toastSuccess('Crawler started successfully')
      return data
    },
    onSettled: () => {
      queryClient.invalidateQueries(getCrawlersQueryOptions(libraryId))
      queryClient.invalidateQueries(aiLibraryFilesQueryOptions({ libraryId, skip: 0, take: 200 }))
    },
  })
  const { t } = useTranslation()

  const handleClick = () => {
    runCrawlerMutation.mutate()
  }

  return (
    <button
      type="button"
      disabled={crawler.isRunning || runCrawlerMutation.isPending}
      onClick={handleClick}
      className="btn btn-primary btn-xs"
    >
      {t('crawlers.run')}
    </button>
  )
}

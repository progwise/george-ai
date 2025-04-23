import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { FragmentType, graphql, useFragment } from '../../../gql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { backendRequest } from '../../../server-functions/backend'
import { aiLibraryFilesQueryOptions } from '../embeddings-table'
import { getCrawlersQueryOptions } from './get-crawlers'

const RunCrawlerButton_CrawlerFragment = graphql(`
  fragment RunCrawlerButton_Crawler on AiLibraryCrawler {
    id
    isRunning
  }
`)

interface RunCrawlerButtonProps {
  libraryId: string
  crawler: FragmentType<typeof RunCrawlerButton_CrawlerFragment>
  userId: string
}

const runCrawler = createServerFn({ method: 'POST' })
  .validator((data: { crawlerId: string; userId: string }) =>
    z
      .object({
        crawlerId: z.string().nonempty(),
        userId: z.string().nonempty(),
      })
      .parse(data),
  )
  .handler(async (ctx) => {
    return await backendRequest(
      graphql(`
        mutation runCrawler($crawlerId: String!, $userId: String!) {
          runAiLibraryCrawler(crawlerId: $crawlerId, userId: $userId) {
            id
            lastRun
          }
        }
      `),
      ctx.data,
    )
  })

export const RunCrawlerButton = ({ libraryId, crawler, userId }: RunCrawlerButtonProps) => {
  const { id, isRunning } = useFragment(RunCrawlerButton_CrawlerFragment, crawler)
  const queryClient = useQueryClient()

  const runCrawlerMutation = useMutation({
    mutationFn: async () => {
      return await runCrawler({ data: { crawlerId: id, userId } })
    },
    onError: () => {
      // TODO: add alert
    },
    onSettled: () => {
      queryClient.invalidateQueries(getCrawlersQueryOptions(libraryId))
      queryClient.invalidateQueries(aiLibraryFilesQueryOptions(libraryId))
    },
  })
  const { t } = useTranslation()

  const handleClick = () => {
    runCrawlerMutation.mutate()
  }

  return (
    <button
      type="button"
      disabled={isRunning || runCrawlerMutation.isPending}
      onClick={handleClick}
      className="btn btn-primary btn-xs"
    >
      {t('crawlers.run')}
    </button>
  )
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { useAuth } from '../../../auth/auth-hook'
import { graphql } from '../../../gql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { backendRequest } from '../../../server-functions/backend'
import { aiLibraryFilesQueryOptions } from '../embeddings-table'
import { getCrawlersQueryOptions } from './get-crawlers'

interface RunCrawlerButtonProps {
  crawlerId: string
  libraryId: string
  isRunning: boolean
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

export const RunCrawlerButton = ({ crawlerId, libraryId, isRunning }: RunCrawlerButtonProps) => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const runCrawlerMutation = useMutation({
    mutationFn: async () => {
      return await runCrawler({ data: { crawlerId, userId: user!.id! } })
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
      className="btn btn-xs"
    >
      {t('crawlers.run')}
    </button>
  )
}

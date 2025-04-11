import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

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
  .validator((crawlerId: string) => z.string().nonempty().parse(crawlerId))
  .handler(async (ctx) => {
    return await backendRequest(
      graphql(`
        mutation runCrawler($id: String!) {
          runAiLibraryCrawler(id: $id) {
            id
            lastRun
          }
        }
      `),
      { id: ctx.data },
    )
  })

export const RunCrawlerButton = ({ crawlerId, libraryId, isRunning }: RunCrawlerButtonProps) => {
  const queryClient = useQueryClient()
  const runCrawlerMutation = useMutation({
    mutationFn: async () => {
      return await runCrawler({ data: crawlerId })
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

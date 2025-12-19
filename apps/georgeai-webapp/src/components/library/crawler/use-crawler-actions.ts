import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { toastError, toastSuccess } from '../../georgeToaster'
import { getCrawlerQueryOptions } from './queries/get-crawler'
import { getCrawlersQueryOptions } from './queries/get-crawlers'
import { addCrawlerFn } from './server-functions/add-crawler-fn'
import { deleteCrawlerFn } from './server-functions/delete-crawler-fn'
import { runCrawlerFn } from './server-functions/run-crawler-fn'
import { stopCrawlerFn } from './server-functions/stop-crawler-fn'
import { updateCrawlerFn } from './server-functions/update-crawler'

interface UseCrawlerActionsProps {
  libraryId: string
}

export const useCrawlerActions = ({ libraryId }: UseCrawlerActionsProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const invalidateRelatedQueries = async (crawlerId: string) => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ['getCrawlerRuns', { libraryId, crawlerId }],
        exact: false,
      }),
      queryClient.invalidateQueries({
        queryKey: ['getCrawler', { libraryId, crawlerId }],
      }),
      queryClient.invalidateQueries({
        queryKey: ['getCrawlers', { libraryId }],
      }),
    ])
  }

  const runCrawlerMutation = useMutation({
    mutationFn: (crawlerId: string) => runCrawlerFn({ data: { crawlerId } }),
    onError: (error) => {
      toastError(error.message || t('crawlers.startFailed'))
    },
    onSuccess: (_data, crawlerId) => {
      toastSuccess(t('crawlers.startSuccess'))
      navigate({ to: '/libraries/$libraryId/crawlers/$crawlerId/runs', params: { libraryId, crawlerId } })
    },
    onSettled: async (_, __, crawlerId) => {
      await invalidateRelatedQueries(crawlerId)
    },
  })

  const stopCrawlerMutation = useMutation({
    mutationFn: (crawlerId: string) => stopCrawlerFn({ data: { crawlerId } }),
    onError: (error) => {
      toastError(error.message || t('crawlers.stopFailed'))
    },
    onSuccess: () => {
      toastSuccess(t('crawlers.stopSuccess'))
    },
    onSettled: async (_, __, crawlerId) => {
      await invalidateRelatedQueries(crawlerId)
    },
  })

  const addCrawlerMutation = useMutation({
    mutationFn: addCrawlerFn,
    onError: (error) => {
      toastError(`${t('crawlers.toastCreateError')}: ${error.message}`)
    },
    onSuccess: async () => {
      toastSuccess(t('crawlers.toastCreateSuccess'))
      await queryClient.invalidateQueries(getCrawlersQueryOptions({ libraryId }))
    },
  })

  const updateCrawlerMutation = useMutation({
    mutationFn: updateCrawlerFn,
    onError: (error) => {
      toastError(`${t('crawlers.toastUpdateError')}: ${error.message}`)
    },
    onSuccess: async (data) => {
      toastSuccess(t('crawlers.toastUpdateSuccess'))
      await Promise.all([
        queryClient.invalidateQueries(getCrawlerQueryOptions({ libraryId, crawlerId: data.updateAiLibraryCrawler.id })),
        queryClient.invalidateQueries(getCrawlersQueryOptions({ libraryId })),
      ])
    },
  })

  const deleteCrawlerMutation = useMutation({
    mutationFn: deleteCrawlerFn,
    onError: (error) => {
      toastError(`${t('crawlers.toastDeleteError')}: ${error.message}`)
    },
    onSuccess: async () => {
      toastSuccess(t('crawlers.toastDeleteSuccess'))
      await queryClient.invalidateQueries(getCrawlersQueryOptions({ libraryId }))
    },
  })

  return {
    runCrawler: runCrawlerMutation.mutate,
    stopCrawler: stopCrawlerMutation.mutate,
    isPending:
      runCrawlerMutation.isPending ||
      stopCrawlerMutation.isPending ||
      addCrawlerMutation.isPending ||
      deleteCrawlerMutation.isPending ||
      updateCrawlerMutation.isPending,
    updateCrawler: updateCrawlerMutation.mutate,
    addCrawler: addCrawlerMutation.mutate,
    deleteCrawler: deleteCrawlerMutation.mutate,
  }
}

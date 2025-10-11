import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { toastError, toastSuccess } from '../../georgeToaster'
import { addCrawlerFn } from './add-crawler-fn'
import { deleteCrawlerFn } from './delete-crawler-fn'
import { getCrawlersQueryOptions } from './get-crawlers'
import { runCrawlerFn } from './run-crawler-fn'
import { stopCrawlerFn } from './stop-crawler-fn'

interface UseCrawlerActionsProps {
  libraryId: string
}

export const useCrawlerActions = ({ libraryId }: UseCrawlerActionsProps) => {
  const { t } = useTranslation()
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
    onSuccess: () => {
      toastSuccess(t('crawlers.startSuccess'))
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

  const handleRunStop = (crawlerId: string, isRunning: boolean) => {
    if (!isRunning) {
      runCrawlerMutation.mutate(crawlerId)
    } else {
      stopCrawlerMutation.mutate(crawlerId)
    }
  }

  const addCrawlerMutation = useMutation({
    mutationFn: addCrawlerFn,
    onError: (error) => {
      toastError(`${t('crawlers.toastCreateError')}: ${error.message}`)
    },
    onSuccess: async () => {
      toastSuccess(t('crawlers.toastCreateSuccess'))
      await queryClient.invalidateQueries(getCrawlersQueryOptions(libraryId))
    },
  })

  const deleteCrawlerMutation = useMutation({
    mutationFn: deleteCrawlerFn,
    onError: (error) => {
      toastError(`${t('crawlers.toastDeleteError')}: ${error.message}`)
    },
    onSuccess: async () => {
      toastSuccess(t('crawlers.toastDeleteSuccess'))
      await queryClient.invalidateQueries(getCrawlersQueryOptions(libraryId))
    },
  })

  return {
    runCrawler: runCrawlerMutation.mutate,
    stopCrawler: stopCrawlerMutation.mutate,
    handleRunStop,
    isPending:
      runCrawlerMutation.isPending ||
      stopCrawlerMutation.isPending ||
      addCrawlerMutation.isPending ||
      deleteCrawlerMutation.isPending,
    addCrawler: addCrawlerMutation.mutate,
    deleteCrawler: deleteCrawlerMutation.mutate,
  }
}

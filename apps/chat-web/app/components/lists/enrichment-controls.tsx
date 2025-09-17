import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useTranslation } from '../../i18n/use-translation-hook'
import { PlayIcon } from '../../icons/play-icon'
import SparklesIcon from '../../icons/sparkles-icon'
import { StopIcon } from '../../icons/stop-icon'
import { toastError, toastSuccess } from '../georgeToaster'
import { getListQueryOptions } from './queries'
import { cleanEnrichments, startEnrichment, stopEnrichment } from './server-functions'

interface EnrichmentControlsProps {
  listId: string
  fieldId: string
  isProcessing: boolean
  onActionExecuted: () => void
}

export const EnrichmentControls = ({ listId, fieldId, isProcessing, onActionExecuted }: EnrichmentControlsProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const startEnrichmentMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData()
      formData.append('listId', listId)
      formData.append('fieldId', fieldId)
      return await startEnrichment({ data: formData })
    },
    onSuccess: async (data) => {
      if (data.createdTasksCount !== undefined) {
        toastSuccess(
          t('lists.enrichment.started', {
            count: data.createdTasksCount || 0,
          }),
        )
        await queryClient.invalidateQueries(getListQueryOptions(listId))
        await queryClient.invalidateQueries({ queryKey: ['AiListFiles'] })
      } else {
        toastError(t('lists.enrichment.startError'))
      }
    },
    onError: (error) => {
      toastError(t('lists.enrichment.startError'))
      console.error('Failed to start enrichment:', error)
    },
    onSettled: () => onActionExecuted(),
  })

  const stopEnrichmentMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData()
      formData.append('listId', listId)
      formData.append('fieldId', fieldId)
      return await stopEnrichment({ data: formData })
    },
    onSuccess: async (data) => {
      if (data.cleanedUpTasksCount !== undefined) {
        toastSuccess(t('lists.enrichment.stopped'))
        await queryClient.invalidateQueries(getListQueryOptions(listId))
        await queryClient.invalidateQueries({ queryKey: ['AiListFiles'] })
      } else {
        toastError(t('lists.enrichment.stopError'))
      }
    },
    onError: (error) => {
      toastError(t('lists.enrichment.stopError'))
      console.error('Failed to stop enrichment:', error)
    },
    onSettled: () => onActionExecuted(),
  })

  const cleanEnrichmentMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData()
      formData.append('listId', listId)
      formData.append('fieldId', fieldId)
      return await cleanEnrichments({ data: formData })
    },
    onSuccess: async (data) => {
      if (data.cleanedUpEnrichmentsCount !== undefined) {
        toastSuccess(
          t('lists.enrichment.cleaned', {
            count: data.cleanedUpEnrichmentsCount || 0,
          }),
        )
        await queryClient.invalidateQueries(getListQueryOptions(listId))
        await queryClient.invalidateQueries({ queryKey: ['AiListFiles'] })
      } else {
        toastError(t('lists.enrichment.cleanError'))
      }
    },
    onError: (error) => {
      toastError(t('lists.enrichment.cleanError'))
      console.error('Failed to clean enrichments:', error)
    },
    onSettled: () => onActionExecuted(),
  })

  const handleStartEnrichment = () => {
    startEnrichmentMutation.mutate()
  }

  const handleStopEnrichment = () => {
    stopEnrichmentMutation.mutate()
  }

  const handleCleanEnrichments = () => {
    cleanEnrichmentMutation.mutate()
  }

  return (
    <>
      {!isProcessing ? (
        <button
          type="button"
          className="hover:bg-base-200 flex w-full items-center px-4 py-2 text-sm transition-colors"
          onClick={handleStartEnrichment}
          disabled={startEnrichmentMutation.isPending}
        >
          <PlayIcon className="mr-2" />
          {t('lists.enrichment.start')}
        </button>
      ) : (
        <button
          type="button"
          className="hover:bg-base-200 flex w-full items-center px-4 py-2 text-sm transition-colors"
          onClick={handleStopEnrichment}
          disabled={stopEnrichmentMutation.isPending}
        >
          <StopIcon className="mr-2" />
          {t('lists.enrichment.stop')}
        </button>
      )}

      <button
        type="button"
        className="hover:bg-base-200 flex w-full items-center px-4 py-2 text-sm transition-colors"
        onClick={handleCleanEnrichments}
        disabled={cleanEnrichmentMutation.isPending}
      >
        <SparklesIcon className="mr-2" />
        {t('lists.enrichment.clean')}
      </button>
    </>
  )
}

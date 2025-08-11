import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useTranslation } from '../../i18n/use-translation-hook'
import { PlayIcon } from '../../icons/play-icon'
import { StopIcon } from '../../icons/stop-icon'
import { TrashIcon } from '../../icons/trash-icon'
import { toastError, toastSuccess } from '../georgeToaster'
import { cleanEnrichments } from './clean-enrichments'
import { getListQueryOptions } from './get-list'
import { startEnrichment } from './start-enrichment'
import { stopEnrichment } from './stop-enrichment'

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
      if (data.success) {
        toastSuccess(
          t('lists.enrichment.started', {
            count: data.queuedItems || 0,
          }),
        )
        await queryClient.invalidateQueries(getListQueryOptions(listId))
        await queryClient.invalidateQueries({ queryKey: ['AiListFiles'] })
      } else {
        toastError(data.error || t('lists.enrichment.startError'))
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
      if (data.success) {
        toastSuccess(t('lists.enrichment.stopped'))
        await queryClient.invalidateQueries(getListQueryOptions(listId))
        await queryClient.invalidateQueries({ queryKey: ['AiListFiles'] })
      } else {
        toastError(data.error || t('lists.enrichment.stopError'))
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
      if (data.cleanListEnrichments.success) {
        toastSuccess(
          t('lists.enrichment.cleaned', {
            count: data.cleanListEnrichments.clearedItems || 0,
          }),
        )
        await queryClient.invalidateQueries(getListQueryOptions(listId))
        await queryClient.invalidateQueries({ queryKey: ['AiListFiles'] })
      } else {
        toastError(data.cleanListEnrichments.error || t('lists.enrichment.cleanError'))
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
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {!isProcessing ? (
          <button
            type="button"
            className="btn btn-primary btn-xs w-full"
            onClick={handleStartEnrichment}
            disabled={startEnrichmentMutation.isPending}
          >
            <PlayIcon className="size-4" />
            {t('lists.enrichment.start')}
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-error btn-xs w-full"
            onClick={handleStopEnrichment}
            disabled={stopEnrichmentMutation.isPending}
          >
            <StopIcon className="size-4" />
            {t('lists.enrichment.stop')}
          </button>
        )}
      </div>

      <button
        type="button"
        className="btn btn-warning btn-xs w-full"
        onClick={handleCleanEnrichments}
        disabled={cleanEnrichmentMutation.isPending}
      >
        {cleanEnrichmentMutation.isPending ? (
          <span className="loading loading-spinner loading-sm" />
        ) : (
          <TrashIcon className="size-4" />
        )}
        {t('lists.enrichment.clean')}
      </button>
    </div>
  )
}

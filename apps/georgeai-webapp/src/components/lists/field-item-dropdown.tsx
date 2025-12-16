import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

import { useTranslation } from '../../i18n/use-translation-hook'
import { CrossIcon } from '../../icons/cross-icon'
import { PlayIcon } from '../../icons/play-icon'
import { TrashIcon } from '../../icons/trash-icon'
import { toastError, toastSuccess } from '../georgeToaster'
import { getListQueryOptions } from './queries'
import { clearEnrichmentFn, startEnrichmentFn, stopEnrichmentFn } from './server-functions'

interface FieldItemDropdownProps {
  listId: string
  fieldId: string
  itemId: string
  fieldName: string
  fileName: string
  isOpen: boolean
  onClose: () => void
  queueStatus?: string | null
  error?: string | null
  failedEnrichmentValue?: string | null
  value?: string | null
}

export const FieldItemDropdown = ({
  listId,
  fieldId,
  itemId,
  fieldName,
  fileName,
  isOpen,
  onClose,
  queueStatus,
  error,
  failedEnrichmentValue,
  value,
}: FieldItemDropdownProps) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const enrichSingleMutation = useMutation({
    mutationFn: async () => {
      return await startEnrichmentFn({ data: { listId, itemId, fieldId } })
    },
    onSuccess: async (data) => {
      if (data.createdTasksCount === 1) {
        toastSuccess(t('lists.enrichment.singleStarted', { field: fieldName, file: fileName }))
        // Invalidate specific queries to preserve pagination
        await queryClient.invalidateQueries(getListQueryOptions(listId))
        await queryClient.invalidateQueries({ queryKey: ['AiListFilesWithValues'] })
      } else {
        toastError(t('lists.enrichment.startError'))
      }
    },
    onError: (error) => {
      toastError(t('lists.enrichment.startError'))
      console.error('Failed to start single enrichment:', error)
    },
    onSettled: () => onClose(),
  })

  const clearEnrichmentMutation = useMutation({
    mutationFn: async () => {
      return await clearEnrichmentFn({ data: { listId, fieldId, itemId } })
    },
    onSuccess: async (data) => {
      if (data.cleanedUpEnrichmentsCount !== undefined) {
        toastSuccess(t('lists.enrichment.clearSuccess', { field: fieldName, file: fileName }))
        await queryClient.invalidateQueries(getListQueryOptions(listId))
        await queryClient.invalidateQueries({ queryKey: ['AiListFilesWithValues'] })
      } else {
        toastError(t('lists.enrichment.clearError'))
      }
    },
    onError: (error) => {
      toastError(t('lists.enrichment.clearError'))
      console.error('Failed to clear enrichment:', error)
    },
    onSettled: () => onClose(),
  })

  const stopEnrichmentMutation = useMutation({
    mutationFn: async () => {
      return await stopEnrichmentFn({ data: { listId, fieldId, itemId } })
    },
    onSuccess: async (data) => {
      if (data.cleanedUpTasksCount !== undefined) {
        toastSuccess(t('lists.enrichment.stopSingleSuccess', { field: fieldName, file: fileName }))
        await queryClient.invalidateQueries(getListQueryOptions(listId))
        await queryClient.invalidateQueries({ queryKey: ['AiListFilesWithValues'] })
      } else {
        toastError(t('lists.enrichment.stopSingleError'))
      }
    },
    onError: (error) => {
      toastError(t('lists.enrichment.stopSingleError'))
      console.error('Failed to stop enrichment:', error)
    },
    onSettled: () => onClose(),
  })

  const handleEnrichSingle = () => {
    enrichSingleMutation.mutate()
  }

  const handleClearEnrichment = () => {
    clearEnrichmentMutation.mutate()
  }

  const handleStopEnrichment = () => {
    stopEnrichmentMutation.mutate()
  }

  const isEnrichmentDisabled = queueStatus === 'processing' || queueStatus === 'pending'
  const hasEnrichment = value || error || failedEnrichmentValue
  const canStopEnrichment = queueStatus === 'pending'

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 z-9999 mt-1 w-56 rounded-lg border border-base-300 bg-base-100 shadow-lg"
    >
      {/* Display error or failed enrichment value if present */}
      {(error || failedEnrichmentValue) && (
        <div className="border-b border-base-300 px-4 py-3">
          {error && (
            <div className="mb-2">
              <div className="mb-1 text-xs font-semibold text-error">❌ {t('lists.enrichment.error')}</div>
              <div className="text-xs wrap-break-word text-error">{error}</div>
            </div>
          )}
          {failedEnrichmentValue && (
            <div>
              <div className="mb-1 text-xs font-semibold text-warning">⚠️ {t('lists.enrichment.failedTerm')}</div>
              <div className="text-xs wrap-break-word text-warning">{failedEnrichmentValue}</div>
            </div>
          )}
        </div>
      )}
      <div className="py-2">
        <button
          type="button"
          className={`flex w-full items-center px-4 py-2 text-sm transition-colors ${
            enrichSingleMutation.isPending || isEnrichmentDisabled
              ? 'cursor-not-allowed text-base-content/40 opacity-50'
              : 'hover:bg-base-200'
          }`}
          onClick={handleEnrichSingle}
          disabled={enrichSingleMutation.isPending || isEnrichmentDisabled}
        >
          {enrichSingleMutation.isPending ? (
            <>
              <span className="loading mr-2 loading-xs loading-spinner text-xs" />
              {t('lists.enrichment.processing')}
            </>
          ) : isEnrichmentDisabled ? (
            <>
              <PlayIcon className="mr-2 size-4" />
              {queueStatus === 'processing' ? '⚙️ Processing...' : '⏳ Pending...'}
            </>
          ) : (
            <>
              <PlayIcon className="mr-2 size-4" />
              {t('lists.enrichment.enrichSingle')}
            </>
          )}
        </button>

        {/* Stop enrichment for pending items */}
        {canStopEnrichment && (
          <button
            type="button"
            className="flex w-full items-center px-4 py-2 text-sm transition-colors hover:bg-base-200"
            onClick={handleStopEnrichment}
            disabled={stopEnrichmentMutation.isPending}
          >
            {stopEnrichmentMutation.isPending ? (
              <>
                <span className="loading mr-2 loading-xs loading-spinner text-xs" />
                {t('lists.enrichment.removing')}
              </>
            ) : (
              <>
                <CrossIcon className="mr-2 size-4" />
                {t('lists.enrichment.stopSingle')}
              </>
            )}
          </button>
        )}

        {/* Clear enrichment for items that already have a value */}
        {hasEnrichment && (
          <button
            type="button"
            className="flex w-full items-center px-4 py-2 text-sm transition-colors hover:bg-base-200"
            onClick={handleClearEnrichment}
            disabled={clearEnrichmentMutation.isPending}
          >
            {clearEnrichmentMutation.isPending ? (
              <>
                <span className="loading mr-2 loading-xs loading-spinner text-xs" />
                {t('lists.enrichment.removing')}
              </>
            ) : (
              <>
                <TrashIcon className="mr-2 size-4" />
                {t('lists.enrichment.clearEnrichment')}
              </>
            )}
          </button>
        )}

        {/*
        Future useful actions to consider:

        1. Manual Value Input - Allow users to manually set/override a value instead of AI enrichment
        <button onClick={handleManualValue}>
          <EditIcon /> Manual Value
        </button>

        2. Copy Value to Clipboard - Quick copy of the enriched value
        <button onClick={handleCopyValue}>
          <CopyIcon /> Copy Value
        </button>

        3. View Enrichment Metadata - Show which AI model was used, similar chunks found, context used, etc.
        <button onClick={handleViewMetadata}>
          <InfoIcon /> View Details
        </button>

        4. Re-enrich with Different Model - Try enrichment again with a different AI model
        <button onClick={handleReEnrichWithModel}>
          <RefreshIcon /> Try Different Model
        </button>
        */}
      </div>
    </div>
  )
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

import { useTranslation } from '../../i18n/use-translation-hook'
import { CrossIcon } from '../../icons/cross-icon'
import { PlayIcon } from '../../icons/play-icon'
import { toastError, toastSuccess } from '../georgeToaster'
import { getListQueryOptions } from './queries'
import { removeFromEnrichmentQueue, startSingleEnrichment } from './server-functions'

interface FieldItemDropdownProps {
  listId: string
  fieldId: string
  fileId: string
  fieldName: string
  fileName: string
  isOpen: boolean
  onClose: () => void
  queueStatus?: string | null
}

export const FieldItemDropdown = ({
  listId,
  fieldId,
  fileId,
  fieldName,
  fileName,
  isOpen,
  onClose,
  queueStatus,
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
      const formData = new FormData()
      formData.append('listId', listId)
      formData.append('fieldId', fieldId)
      formData.append('fileId', fileId)
      return await startSingleEnrichment({ data: formData })
    },
    onSuccess: async (data) => {
      if (data.startSingleEnrichment.success) {
        toastSuccess(t('lists.enrichment.singleStarted', { field: fieldName, file: fileName }))
        // Invalidate specific queries to preserve pagination
        await queryClient.invalidateQueries(getListQueryOptions(listId))
        await queryClient.invalidateQueries({ queryKey: ['AiListFilesWithValues'] })
      } else {
        toastError(data.startSingleEnrichment.error || t('lists.enrichment.startError'))
      }
    },
    onError: (error) => {
      toastError(t('lists.enrichment.startError'))
      console.error('Failed to start single enrichment:', error)
    },
    onSettled: () => onClose(),
  })

  const removeFromQueueMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData()
      formData.append('listId', listId)
      formData.append('fieldId', fieldId)
      formData.append('fileId', fileId)
      return await removeFromEnrichmentQueue({ data: formData })
    },
    onSuccess: async (data) => {
      if (data.removeFromEnrichmentQueue.success) {
        toastSuccess(t('lists.enrichment.removedFromQueue', { field: fieldName, file: fileName }))
        // Invalidate specific queries to preserve pagination
        await queryClient.invalidateQueries(getListQueryOptions(listId))
        await queryClient.invalidateQueries({ queryKey: ['AiListFilesWithValues'] })
      } else {
        toastError(data.removeFromEnrichmentQueue.error || t('lists.enrichment.removeError'))
      }
    },
    onError: (error) => {
      toastError(t('lists.enrichment.removeError'))
      console.error('Failed to remove from enrichment queue:', error)
    },
    onSettled: () => onClose(),
  })

  const handleEnrichSingle = () => {
    enrichSingleMutation.mutate()
  }

  const handleRemoveFromQueue = () => {
    removeFromQueueMutation.mutate()
  }

  const isEnrichmentDisabled = queueStatus === 'processing' || queueStatus === 'pending'
  const canRemoveFromQueue = queueStatus === 'processing' || queueStatus === 'pending'

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="bg-base-100 border-base-300 absolute right-0 top-full z-[9999] mt-1 w-56 rounded-lg border shadow-lg"
    >
      <div className="py-2">
        <button
          type="button"
          className={`flex w-full items-center px-4 py-2 transition-colors ${
            enrichSingleMutation.isPending || isEnrichmentDisabled
              ? 'text-base-content/40 cursor-not-allowed opacity-50'
              : 'hover:bg-base-200 button button-xs'
          }`}
          onClick={handleEnrichSingle}
          disabled={enrichSingleMutation.isPending || isEnrichmentDisabled}
        >
          {enrichSingleMutation.isPending ? (
            <>
              <span className="loading loading-spinner loading-xs mr-2 text-xs" />
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

        {/* Remove from queue option for pending/processing items */}
        {canRemoveFromQueue && (
          <button
            type="button"
            className="hover:bg-base-200 flex w-full items-center px-4 py-2 text-sm transition-colors"
            onClick={handleRemoveFromQueue}
            disabled={removeFromQueueMutation.isPending}
          >
            {removeFromQueueMutation.isPending ? (
              <>
                <span className="loading loading-spinner loading-xs mr-2 text-xs" />
                {t('lists.enrichment.removing')}
              </>
            ) : (
              <>
                <CrossIcon className="mr-2 size-4" />
                {t('lists.enrichment.removeFromQueue')}
              </>
            )}
          </button>
        )}

        {/* Future options can be added here */}
        {/* 
        <button
          type="button"
          className="hover:bg-base-200 flex w-full items-center px-4 py-2 text-sm transition-colors"
          onClick={handleClearEnrichment}
        >
          <TrashIcon className="mr-2" />
          {t('lists.enrichment.clearSingle')}
        </button>
        
        <button
          type="button"
          className="hover:bg-base-200 flex w-full items-center px-4 py-2 text-sm transition-colors"
          onClick={handleManualValue}
        >
          <EditIcon className="mr-2" />
          {t('lists.enrichment.manualValue')}
        </button>
        */}
      </div>
    </div>
  )
}

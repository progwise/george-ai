import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

import { useTranslation } from '../../i18n/use-translation-hook'
import { PlayIcon } from '../../icons/play-icon'
import { toastError, toastSuccess } from '../georgeToaster'
import { getListQueryOptions } from './get-list'
import { startSingleEnrichment } from './start-single-enrichment'

interface FieldItemDropdownProps {
  listId: string
  fieldId: string
  fileId: string
  fieldName: string
  fileName: string
  isOpen: boolean
  onClose: () => void
}

export const FieldItemDropdown = ({
  listId,
  fieldId,
  fileId,
  fieldName,
  fileName,
  isOpen,
  onClose,
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
        await queryClient.invalidateQueries(getListQueryOptions(listId))
        await queryClient.invalidateQueries({ queryKey: ['AiListFiles'] })
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

  const handleEnrichSingle = () => {
    enrichSingleMutation.mutate()
  }

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="bg-base-100 border-base-300 absolute right-0 top-full z-[9999] mt-1 w-56 rounded-lg border shadow-lg"
    >
      <div className="py-2">
        <button
          type="button"
          className="hover:bg-base-200 button button-xs flex w-full items-center px-4 py-2 transition-colors"
          onClick={handleEnrichSingle}
          disabled={enrichSingleMutation.isPending}
        >
          {enrichSingleMutation.isPending ? (
            <>
              <span className="loading loading-spinner loading-xs mr-2 text-xs" />
              {t('lists.enrichment.processing')}
            </>
          ) : (
            <>
              <PlayIcon className="mr-2 size-4" />
              {t('lists.enrichment.enrichSingle')}
            </>
          )}
        </button>

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

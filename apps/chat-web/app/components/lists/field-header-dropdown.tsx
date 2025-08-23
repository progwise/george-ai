import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'

import { FieldModal_EditableFieldFragment, ListFieldsTable_ListFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { EditIcon } from '../../icons/edit-icon'
import { TrashIcon } from '../../icons/trash-icon'
import { toastSuccess } from '../georgeToaster'
import { EnrichmentControls } from './enrichment-controls'
import { getListQueryOptions } from './get-list'
import { removeListField } from './remove-list-field'

interface FieldHeaderDropdownProps {
  field: ListFieldsTable_ListFragment['fields'][0]
  isOpen: boolean
  onClose: () => void
  onEdit: (field: FieldModal_EditableFieldFragment) => void
}

export const FieldHeaderDropdown = ({ field, isOpen, onClose, onEdit }: FieldHeaderDropdownProps) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsConfirmingDelete(false)
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

  const removeFieldMutation = useMutation({
    mutationFn: async (fieldId: string) => {
      const formData = new FormData()
      formData.append('id', fieldId)
      return await removeListField({ data: formData })
    },
    onSuccess: () => {
      // Show success toast with field name
      toastSuccess(t('lists.fields.removeSuccess', { name: field.name }))

      queryClient.invalidateQueries(getListQueryOptions(field.listId))
      onClose()
      setIsConfirmingDelete(false)
    },
  })

  const handleEdit = () => {
    onEdit(field)
    onClose()
  }

  const handleDelete = () => {
    if (isConfirmingDelete) {
      removeFieldMutation.mutate(field.id)
    } else {
      setIsConfirmingDelete(true)
    }
  }

  const canEdit = field.sourceType === 'llm_computed'
  const canDelete = field.sourceType === 'llm_computed'
  const canEnrich = field.sourceType === 'llm_computed'

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="bg-base-100 border-base-300 absolute right-0 top-full z-[9999] mt-1 w-60 rounded-lg border shadow-lg"
    >
      <div className="py-2">
        {canEnrich && (
          <div className="border-base-300 border-b px-3">
            <div className="text-base-content/60 mb-1 text-xs font-semibold uppercase">
              {field.pendingItemsCount > 0 || field.processingItemsCount > 0 ? (
                <div className="flex items-center gap-2">
                  <div className="loading loading-ring text-primary"></div>
                  <span>
                    {field.processingItemsCount > 0 && `${field.processingItemsCount} processing`}
                    {field.processingItemsCount > 0 && field.pendingItemsCount > 0 && ', '}
                    {field.pendingItemsCount > 0 && `${field.pendingItemsCount} pending`}
                  </span>
                </div>
              ) : (
                <span>{t('lists.enrichment.title')}</span>
              )}
            </div>
          </div>
        )}
        <div className="border-base-300 border-b">
          <EnrichmentControls
            listId={field.listId}
            fieldId={field.id}
            isProcessing={field.pendingItemsCount > 0 || field.processingItemsCount > 0}
            onActionExecuted={() => onClose()}
          />
        </div>
        {canEdit && (
          <button
            type="button"
            className="hover:bg-base-200 flex w-full items-center px-4 py-2 text-sm transition-colors"
            onClick={handleEdit}
          >
            <EditIcon className="mr-2" />
            {t('lists.fields.edit')}
          </button>
        )}

        {canDelete && (
          <button
            type="button"
            className={`flex w-full items-center px-4 py-2 text-sm transition-colors ${
              isConfirmingDelete ? 'text-error bg-error/10 hover:bg-error/20' : 'hover:bg-base-200 text-base-content'
            }`}
            onClick={handleDelete}
            disabled={removeFieldMutation.isPending}
          >
            {removeFieldMutation.isPending ? (
              <>
                <span className="loading loading-spinner loading-sm mr-2" />
                {t('lists.fields.deleting')}
              </>
            ) : (
              <>
                <TrashIcon className="mr-2" />
                {isConfirmingDelete ? t('lists.fields.confirmDelete') : t('lists.fields.delete')}
              </>
            )}
          </button>
        )}

        {!canEdit && !canDelete && !canEnrich && (
          <div className="text-base-content/60 px-4 py-2 text-sm">{t('lists.fields.filePropertyReadOnly')}</div>
        )}
      </div>
    </div>
  )
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { graphql } from '../../gql'
import { ListFieldsTable_ListFragment } from '../../gql/graphql'
import { backendRequest } from '../../server-functions/backend'

const removeListFieldMutation = graphql(`
  mutation removeListField($id: String!) {
    removeListField(id: $id) {
      id
    }
  }
`)

interface FieldHeaderDropdownProps {
  field: ListFieldsTable_ListFragment['fields'][0]
  listId: string
  isOpen: boolean
  onClose: () => void
  onEdit: (field: ListFieldsTable_ListFragment['fields'][0]) => void
}

export const FieldHeaderDropdown = ({ field, listId, isOpen, onClose, onEdit }: FieldHeaderDropdownProps) => {
  const queryClient = useQueryClient()
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  const removeFieldMutation = useMutation({
    mutationFn: async (fieldId: string) => {
      return backendRequest(removeListFieldMutation, { id: fieldId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['AiList', { listId }] })
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

  if (!isOpen) return null

  return (
    <div className="absolute right-0 top-full z-50 mt-1 w-48 bg-base-100 rounded-lg shadow-lg border border-base-300">
      <div className="py-2">
        {canEdit && (
          <button
            type="button"
            className="flex w-full items-center px-4 py-2 text-sm hover:bg-base-200 transition-colors"
            onClick={handleEdit}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Field
          </button>
        )}
        
        {canDelete && (
          <button
            type="button"
            className={`flex w-full items-center px-4 py-2 text-sm transition-colors ${
              isConfirmingDelete
                ? 'text-error bg-error/10 hover:bg-error/20'
                : 'hover:bg-base-200 text-base-content'
            }`}
            onClick={handleDelete}
            disabled={removeFieldMutation.isPending}
          >
            {removeFieldMutation.isPending ? (
              <>
                <span className="loading loading-spinner loading-sm mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {isConfirmingDelete ? 'Click again to confirm' : 'Delete Field'}
              </>
            )}
          </button>
        )}

        {!canEdit && !canDelete && (
          <div className="px-4 py-2 text-sm text-base-content/60">
            File property fields cannot be modified
          </div>
        )}

        {(canEdit || canDelete) && (
          <button
            type="button"
            className="flex w-full items-center px-4 py-2 text-sm hover:bg-base-200 transition-colors"
            onClick={() => {
              setIsConfirmingDelete(false)
              onClose()
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { graphql } from '../../gql'
import { FieldModal_EditableFieldFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { toastSuccess } from '../georgeToaster'
import { getChatModelsQueryOptions } from '../model/get-models'
import { addListField } from './add-list-field'
import { updateListField } from './update-list-field'

graphql(`
  fragment FieldModal_EditableField on AiListField {
    id
    name
    type
    prompt
    languageModel
    order
  }
`)

interface FieldModalProps {
  listId: string
  isOpen: boolean
  onClose: () => void
  maxOrder: number
  editField?: FieldModal_EditableFieldFragment | null
}

const FIELD_TYPES = [
  { value: 'string', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Yes/No' },
  { value: 'date', label: 'Date' },
  { value: 'datetime', label: 'Date & Time' },
]

export const FieldModal = ({ listId, isOpen, onClose, maxOrder, editField }: FieldModalProps) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  // Query available AI chat models
  const { data: aiModelsData } = useSuspenseQuery(getChatModelsQueryOptions())

  const availableModels = aiModelsData?.aiChatModels || []

  const isEditMode = !!editField

  const addFieldMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await addListField({ data: formData })
    },
    onSuccess: (data) => {
      // Show success toast with field name
      toastSuccess(t('lists.fields.addSuccess', { name: data.addListField.name }))

      // Invalidate queries to refetch list data
      queryClient.invalidateQueries({ queryKey: ['AiList', { listId }] })
      onClose()
    },
  })

  const updateFieldMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await updateListField({ data: formData })
    },
    onSuccess: (data) => {
      // Show success toast with field name
      toastSuccess(t('lists.fields.updateSuccess', { name: data.updateListField.name }))

      // Invalidate queries to refetch list data
      queryClient.invalidateQueries({ queryKey: ['AiList', { listId }] })
      onClose()
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    if (isEditMode) {
      updateFieldMutation.mutate(formData)
    } else {
      addFieldMutation.mutate(formData)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-2xl">
        <h3 className="mb-4 text-lg font-bold">{t(isEditMode ? 'lists.fields.editTitle' : 'lists.fields.addTitle')}</h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hidden Fields */}
          <input type="hidden" name="id" value={editField?.id || ''} />
          <input type="hidden" name="listId" value={listId} />
          <input type="hidden" name="sourceType" value="llm_computed" />
          <input type="hidden" name="order" value={editField?.order?.toString() || (maxOrder + 1).toString()} />

          {/* Grid Layout for Form Fields */}
          <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
            {/* Field Name */}
            <label className="label justify-start">
              <span className="label-text font-medium">Field Name *</span>
            </label>
            <div className="md:col-span-3">
              <input
                type="text"
                name="name"
                className="input input-bordered w-full"
                placeholder="e.g., Sentiment, Category, Priority"
                defaultValue={editField?.name || ''}
                required
              />
            </div>

            {/* Field Type */}
            <label className="label justify-start">
              <span className="label-text font-medium">Data Type</span>
            </label>
            <div className="md:col-span-3">
              <select name="type" className="select select-bordered w-full" defaultValue={editField?.type || 'string'}>
                {FIELD_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* AI Model */}
            <label className="label justify-start">
              <span className="label-text font-medium">AI Model *</span>
            </label>
            <div className="md:col-span-3">
              <select
                name="languageModel"
                className="select select-bordered w-full"
                defaultValue={editField?.languageModel || ''}
                required
              >
                <option value="">Select an AI model...</option>
                {availableModels.map((model) => (
                  <option key={model.model} value={model.model}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Prompt */}
            <label className="label justify-start self-start">
              <span className="label-text font-medium">AI Prompt *</span>
            </label>
            <div className="md:col-span-3">
              <textarea
                name="prompt"
                className="textarea textarea-bordered h-24 w-full"
                placeholder="Describe what you want the AI to extract or analyze from each file. Example: 'Analyze the sentiment of this document and return either Positive, Negative, or Neutral'"
                defaultValue={editField?.prompt || ''}
                required
              />
              <div className="mt-1">
                <span className="text-base-content/60 text-xs">
                  The AI will analyze each file's content using this prompt
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={addFieldMutation.isPending || updateFieldMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={addFieldMutation.isPending || updateFieldMutation.isPending}
            >
              {(addFieldMutation.isPending || updateFieldMutation.isPending) && (
                <span className="loading loading-spinner loading-sm" />
              )}
              {isEditMode ? 'Update Field' : 'Add Field'}
            </button>
          </div>
        </form>

        {(addFieldMutation.isError || updateFieldMutation.isError) && (
          <div className="alert alert-error mt-4">
            <span>
              {addFieldMutation.error instanceof Error
                ? addFieldMutation.error.message
                : updateFieldMutation.error instanceof Error
                  ? updateFieldMutation.error.message
                  : `Failed to ${isEditMode ? 'update' : 'add'} field`}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

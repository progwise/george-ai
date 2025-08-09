import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { graphql } from '../../gql'
import { AiListFieldInput } from '../../gql/graphql'
import { getChatModelsQueryOptions } from '../model/get-models'
import { backendRequest } from '../../server-functions/backend'

const addListFieldMutation = graphql(`
  mutation addListField($listId: String!, $data: AiListFieldInput!) {
    addListField(listId: $listId, data: $data) {
      id
      name
      type
      order
      sourceType
      fileProperty
      prompt
      languageModel
    }
  }
`)


interface AddFieldModalProps {
  listId: string
  isOpen: boolean
  onClose: () => void
  maxOrder: number
}

const FIELD_TYPES = [
  { value: 'string', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Yes/No' },
  { value: 'date', label: 'Date' },
  { value: 'datetime', label: 'Date & Time' },
]

export const AddFieldModal = ({ listId, isOpen, onClose, maxOrder }: AddFieldModalProps) => {
  const queryClient = useQueryClient()

  // Query available AI chat models
  const { data: aiModelsData } = useSuspenseQuery(getChatModelsQueryOptions())

  const availableModels = aiModelsData?.aiChatModels || []

  const [formData, setFormData] = useState({
    name: '',
    type: 'string',
    prompt: '',
    languageModel: '',
  })

  const addFieldMutation = useMutation({
    mutationFn: async (data: AiListFieldInput) => {
      return backendRequest(addListFieldMutation, { listId, data })
    },
    onSuccess: () => {
      // Invalidate queries to refetch list data
      queryClient.invalidateQueries({ queryKey: ['AiList', { listId }] })
      onClose()
      setFormData({ name: '', type: 'string', prompt: '', languageModel: '' })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.prompt.trim() || !formData.languageModel) return

    addFieldMutation.mutate({
      name: formData.name.trim(),
      type: formData.type,
      order: maxOrder + 1,
      sourceType: 'llm_computed',
      prompt: formData.prompt.trim(),
      languageModel: formData.languageModel,
      fileProperty: null,
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-2xl">
        <h3 className="text-lg font-bold mb-4">Add Enrichment Field</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grid Layout for Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            {/* Field Name */}
            <label className="label justify-start">
              <span className="label-text font-medium">Field Name *</span>
            </label>
            <div className="md:col-span-3">
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="e.g., Sentiment, Category, Priority"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            {/* Field Type */}
            <label className="label justify-start">
              <span className="label-text font-medium">Data Type</span>
            </label>
            <div className="md:col-span-3">
              <select
                className="select select-bordered w-full"
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
              >
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
                className="select select-bordered w-full"
                value={formData.languageModel}
                onChange={(e) => handleInputChange('languageModel', e.target.value)}
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
                className="textarea textarea-bordered h-24 w-full"
                placeholder="Describe what you want the AI to extract or analyze from each file. Example: 'Analyze the sentiment of this document and return either Positive, Negative, or Neutral'"
                value={formData.prompt}
                onChange={(e) => handleInputChange('prompt', e.target.value)}
                required
              />
              <div className="mt-1">
                <span className="text-xs text-base-content/60">
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
              disabled={addFieldMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={addFieldMutation.isPending || !formData.name.trim() || !formData.prompt.trim() || !formData.languageModel}
            >
              {addFieldMutation.isPending && <span className="loading loading-spinner loading-sm" />}
              Add Field
            </button>
          </div>
        </form>

        {addFieldMutation.isError && (
          <div className="alert alert-error mt-4">
            <span>
              {addFieldMutation.error instanceof Error
                ? addFieldMutation.error.message
                : 'Failed to add field'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
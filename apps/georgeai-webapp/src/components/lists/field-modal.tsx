import { useMutation, useQueryClient } from '@tanstack/react-query'
import React, { useId, useMemo, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { z } from 'zod'

import { validateForm } from '@george-ai/web-utils'

import { graphql } from '../../gql'
import {
  FieldModal_FieldFragment,
  FieldModal_ListFragment,
  ListFieldSourceType,
  ListFieldType,
} from '../../gql/graphql'
import { Language, translate } from '../../i18n'
import { useTranslation } from '../../i18n/use-translation-hook'
import { Input } from '../form/input'
import { ModelSelect } from '../form/model-select'
import { Select } from '../form/select'
import { toastError, toastSuccess } from '../georgeToaster'
import { ReferencedFields } from './context/referenced-fields'
import { SimilarContent } from './context/similar-content'
import { WebFetch } from './context/web-fetch'
import { addListFieldFn, updateListFieldFn } from './server-functions'

export const getListFieldFormSchema = (editMode: 'update' | 'create', language: Language) =>
  z.object({
    id:
      editMode === 'update'
        ? z.string().nonempty(translate('lists.fields.fieldIdRequired', language))
        : z.string().optional(),
    listId:
      editMode === 'create'
        ? z.string().nonempty(translate('lists.fields.listIdRequired', language))
        : z.string().optional(),
    name: z
      .string()
      .min(2, translate('lists.fields.nameTooShort', language))
      .max(100, translate('lists.fields.nameTooLong', language)),
    type: z.nativeEnum(ListFieldType, { message: translate('lists.fields.typeRequired', language) }),
    sourceType: z.nativeEnum(ListFieldSourceType, { message: translate('lists.fields.sourceTypeRequired', language) }),
    languageModelId: z.string().nonempty(translate('lists.fields.languageModelRequired', language)),
    prompt: z
      .string()
      .min(10, translate('lists.fields.promptTooShort', language))
      .max(2000, translate('lists.fields.promptTooLong', language)),
    failureTerms: z
      .string()
      .optional()
      .transform((val) => val?.trim() || null),
    order: z.string().optional(),
    fileProperty: z.string().optional(),
  })

// Infer TypeScript type from schema
export type ListFieldFormInput = z.infer<ReturnType<typeof getListFieldFormSchema>>

graphql(`
  fragment FieldModal_List on AiList {
    id
    fields {
      id
      name
      type
      sourceType
    }
  }
`)

graphql(`
  fragment FieldModal_Field on AiListField {
    id
    name
    type
    prompt
    failureTerms
    languageModel {
      id
      provider
      name
    }
    order
    contextFieldReferences {
      ...ReferencedFields_FieldReferences
    }
    contextVectorSearches {
      ...SimilarContent_VectorSearches
    }
    contextWebFetches {
      ...WebFetch_WebFetches
    }
  }
`)

interface FieldModalProps {
  list: FieldModal_ListFragment
  maxOrder: number
  editField?: FieldModal_FieldFragment | null
  ref: React.RefObject<HTMLDialogElement | null>
}

export const FieldModal = ({ list, maxOrder, editField, ref }: FieldModalProps) => {
  const queryClient = useQueryClient()
  const { t, language } = useTranslation()

  const tablistName = useId()
  const [activeTab, setActiveTab] = useState<'instruction' | 'context'>('instruction')
  const [contextSubTab, setContextSubTab] = useState<'fields' | 'similarity' | 'webFetch'>('fields')

  const fieldId = useMemo(() => editField?.id || '', [editField])
  const fieldReferences = useMemo(() => editField?.contextFieldReferences || [], [editField])
  const vectorSearches = useMemo(() => editField?.contextVectorSearches || [], [editField])
  const webFetches = useMemo(() => editField?.contextWebFetches || [], [editField])

  const isEditMode = useMemo(() => !!editField, [editField])

  const handleCloseModal = () => {
    setActiveTab('instruction')
    setContextSubTab('fields')
    ref.current?.close()
  }

  const schema = useMemo(
    () => getListFieldFormSchema(isEditMode ? 'update' : 'create', language),
    [isEditMode, language],
  )

  const addFieldMutation = useMutation({
    mutationFn: async (data: ListFieldFormInput) => {
      return await addListFieldFn({ data })
    },
    onSuccess: (data) => {
      // Show success toast with field name
      toastSuccess(t('lists.fields.addSuccess', { name: data.addListField.name }))

      // Invalidate queries to refetch list data
      queryClient.invalidateQueries({ queryKey: ['AiList', { listId: list.id }] })
      handleCloseModal()
    },
  })

  const updateFieldMutation = useMutation({
    mutationFn: async (data: ListFieldFormInput) => {
      return await updateListFieldFn({ data })
    },
    onSuccess: ({ updateListField }) => {
      // Show success toast with field name
      toastSuccess(t('lists.fields.updateSuccess', { name: updateListField.name }))

      // Invalidate queries to refetch list data
      queryClient.invalidateQueries({ queryKey: ['AiList', { listId: list.id }] })
      handleCloseModal()
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const { data, errors } = validateForm(e.currentTarget, schema)
    if (errors) {
      toastError(errors.map((error) => <div key={error}>{error}</div>))
      return
    }

    // Extract context sources from form
    const formData = new FormData(e.currentTarget)
    const contextFieldReferences: Array<{
      id?: string
      contextFieldId: string
    }> = []
    const contextVectorSearches: Array<{
      id?: string
      contextQuery: string
      maxContentTokens: number
    }> = []
    const contextWebFetches: Array<{
      id?: string
      contextQuery: string
      maxContentTokens: number
    }> = []

    // Extract field references (checkboxes)
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('contextFieldReference_') && value) {
        contextFieldReferences.push({
          contextFieldId: value as string,
        })
      }
    }

    // Extract existing vector searches (with IDs)
    let vectorSearchIndex = 0
    while (formData.has(`vectorSearch_id_${vectorSearchIndex}`)) {
      const id = formData.get(`vectorSearch_id_${vectorSearchIndex}`) as string
      const queryTemplate = formData.get(`vectorSearch_queryTemplate_${vectorSearchIndex}`) as string
      const maxTokens = formData.get(`vectorSearch_maxTokens_${vectorSearchIndex}`) as string
      const maxChunks = formData.get(`vectorSearch_maxChunks_${vectorSearchIndex}`) as string
      const maxDistance = formData.get(`vectorSearch_maxDistance_${vectorSearchIndex}`) as string

      if (queryTemplate?.trim()) {
        contextVectorSearches.push({
          id,
          contextQuery: JSON.stringify({
            queryTemplate: queryTemplate.trim(),
            maxChunks: maxChunks ? parseInt(maxChunks, 10) : 5,
            maxDistance: maxDistance ? parseFloat(maxDistance) : 0.5,
          }),
          maxContentTokens: maxTokens ? parseInt(maxTokens, 10) : 1000,
        })
      }
      vectorSearchIndex++
    }

    // Add new vector searches (indexed)
    let newVectorSearchIndex = 0
    while (formData.has(`vectorSearch_queryTemplate_new_${newVectorSearchIndex}`)) {
      const queryTemplate = formData.get(`vectorSearch_queryTemplate_new_${newVectorSearchIndex}`) as string
      const maxTokens = formData.get(`vectorSearch_maxTokens_new_${newVectorSearchIndex}`) as string
      const maxChunks = formData.get(`vectorSearch_maxChunks_new_${newVectorSearchIndex}`) as string
      const maxDistance = formData.get(`vectorSearch_maxDistance_new_${newVectorSearchIndex}`) as string

      if (queryTemplate?.trim()) {
        contextVectorSearches.push({
          contextQuery: JSON.stringify({
            queryTemplate: queryTemplate.trim(),
            maxChunks: maxChunks ? parseInt(maxChunks, 10) : 5,
            maxDistance: maxDistance ? parseFloat(maxDistance) : 0.5,
          }),
          maxContentTokens: maxTokens ? parseInt(maxTokens, 10) : 1000,
        })
      }
      newVectorSearchIndex++
    }

    // Extract existing web fetches (with IDs)
    let webFetchIndex = 0
    while (formData.has(`webFetch_id_${webFetchIndex}`)) {
      const id = formData.get(`webFetch_id_${webFetchIndex}`) as string
      const urlTemplate = formData.get(`webFetch_urlTemplate_${webFetchIndex}`) as string
      const maxTokens = formData.get(`webFetch_maxTokens_${webFetchIndex}`) as string

      if (urlTemplate?.trim()) {
        contextWebFetches.push({
          id,
          contextQuery: JSON.stringify({ urlTemplate: urlTemplate.trim() }),
          maxContentTokens: maxTokens ? parseInt(maxTokens, 10) : 1000,
        })
      }
      webFetchIndex++
    }

    // Add new web fetches (indexed)
    let newWebFetchIndex = 0
    while (formData.has(`webFetch_urlTemplate_new_${newWebFetchIndex}`)) {
      const urlTemplate = formData.get(`webFetch_urlTemplate_new_${newWebFetchIndex}`) as string
      const maxTokens = formData.get(`webFetch_maxTokens_new_${newWebFetchIndex}`) as string

      if (urlTemplate?.trim()) {
        contextWebFetches.push({
          contextQuery: JSON.stringify({ urlTemplate: urlTemplate.trim() }),
          maxContentTokens: maxTokens ? parseInt(maxTokens, 10) : 1000,
        })
      }
      newWebFetchIndex++
    }

    // Merge all context sources into a single array with proper structure
    const contextSources: Array<{
      contextType: string
      contextFieldId?: string
      contextQuery?: string
      maxContentTokens?: number
    }> = [
      ...contextFieldReferences.map((ref) => ({
        contextType: 'fieldReference',
        contextFieldId: ref.contextFieldId,
      })),
      ...contextVectorSearches.map((search) => ({
        contextType: 'vectorSearch',
        contextQuery: search.contextQuery,
        maxContentTokens: search.maxContentTokens,
      })),
      ...contextWebFetches.map((fetch) => ({
        contextType: 'webFetch',
        contextQuery: fetch.contextQuery,
        maxContentTokens: fetch.maxContentTokens,
      })),
    ]

    const dataWithContextSources = {
      ...data,
      contextSources: contextSources.length > 0 ? contextSources : undefined,
    }

    if (isEditMode) {
      updateFieldMutation.mutate(dataWithContextSources)
    } else {
      addFieldMutation.mutate(dataWithContextSources)
    }
  }

  const dataTypeOptions = useMemo(
    () =>
      Object.keys(ListFieldType).map((key: keyof typeof ListFieldType) => ({
        id: ListFieldType[key],
        name: t(`lists.fields.types.${ListFieldType[key]}`),
      })),
    [t],
  )

  const dataTypeDefaultOptions = useMemo(
    () => dataTypeOptions.find((option) => option.id === ListFieldType.Text),
    [dataTypeOptions],
  )

  // Calculate total context sources count
  const totalContextCount = (fieldReferences.length || 0) + (vectorSearches.length || 0) + (webFetches.length || 0)

  return (
    <dialog ref={ref} className="modal">
      <div className="modal-box flex h-[80vh] max-h-[800px] w-11/12 max-w-3xl flex-col">
        <h3 className="mb-4 shrink-0 text-lg font-bold">
          {t(isEditMode ? 'lists.fields.editTitle' : 'lists.fields.addTitle')}
        </h3>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          {/* Hidden Fields */}
          <input type="hidden" name="id" value={fieldId} />
          <input type="hidden" name="listId" value={list.id} />
          <input type="hidden" name="sourceType" value="llm_computed" />
          <input type="hidden" name="order" value={editField?.order?.toString() || (maxOrder + 1).toString()} />

          <div className="flex min-h-0 flex-1 flex-col gap-4">
            {/* Field Name - Always Visible */}
            <div className="shrink-0">
              <Input
                label={t('lists.fields.fieldName')}
                type="text"
                name="name"
                placeholder={t('lists.fields.fieldNamePlaceholder')}
                value={editField?.name}
                schema={schema}
                required
              />
            </div>

            <div className="flex min-h-0 flex-1 flex-col">
              {/* Tabs - Horizontal with Radio Controls */}
              <div role="tablist" className="tabs tabs-border min-h-0 shrink-0">
                <input
                  type="radio"
                  name={tablistName}
                  className="tab"
                  role="tab"
                  aria-label={t('lists.fields.stepWhat')}
                  checked={activeTab === 'instruction'}
                  onChange={() => setActiveTab('instruction')}
                />
                <input
                  type="radio"
                  name={tablistName}
                  className="tab"
                  role="tab"
                  checked={activeTab === 'context'}
                  aria-label={
                    totalContextCount > 0
                      ? `${t('lists.fields.stepWhere')} (${totalContextCount})`
                      : t('lists.fields.stepWhere')
                  }
                  onChange={() => setActiveTab('context')}
                />
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                <div className={twMerge('border-base-300 bg-base-100', activeTab !== 'instruction' && 'hidden')}>
                  <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Select
                          label={t('lists.fields.dataType')}
                          name="type"
                          options={dataTypeOptions}
                          value={
                            dataTypeOptions.find((option) => option.id === editField?.type) || dataTypeDefaultOptions
                          }
                          schema={schema}
                          required
                        />
                      </div>
                      <div>
                        <Input
                          label={t('lists.fields.failureTerms')}
                          type="text"
                          name="failureTerms"
                          placeholder={t('lists.fields.failureTermsPlaceholder')}
                          value={editField?.failureTerms || ''}
                          schema={schema}
                          required={false}
                        />
                      </div>
                    </div>

                    <div></div>

                    <ModelSelect
                      label={t('lists.fields.aiModel')}
                      name="languageModelId"
                      value={editField?.languageModel || null}
                      placeholder={t('lists.fields.selectAiModel')}
                      capability="chat"
                      className="w-full"
                      schema={schema}
                      required
                    />

                    <div>
                      <Input
                        label={t('lists.fields.aiPrompt')}
                        type="textarea"
                        name="prompt"
                        placeholder={t('lists.fields.aiPromptPlaceholder')}
                        value={editField?.prompt}
                        schema={schema}
                        required
                        className="h-40"
                      />
                      <div className="mt-1">
                        <span className="text-base-content/60 text-xs">{t('lists.fields.aiPromptHelp')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Context Tab with Nested Sub-Navigation */}
                <div
                  className={twMerge(
                    'border-base-300 bg-base-100 flex h-full flex-col',
                    activeTab !== 'context' && 'hidden',
                  )}
                >
                  <div className="border-base-300 flex min-h-0 flex-1 border-t">
                    {/* Vertical Sub-Navigation */}
                    <nav className="border-base-300 flex w-48 shrink-0 flex-col overflow-y-auto border-r">
                      <button
                        type="button"
                        className={twMerge(
                          'btn btn-ghost justify-start rounded-none text-sm',
                          contextSubTab === 'fields' && 'btn-active',
                        )}
                        onClick={() => setContextSubTab('fields')}
                      >
                        {t('lists.contextSources.referencedFields')}
                      </button>
                      <button
                        type="button"
                        className={twMerge(
                          'btn btn-ghost justify-start rounded-none text-sm',
                          contextSubTab === 'similarity' && 'btn-active',
                        )}
                        onClick={() => setContextSubTab('similarity')}
                      >
                        {t('lists.contextSources.similarContent')}
                      </button>
                      <button
                        type="button"
                        className={twMerge(
                          'btn btn-ghost justify-start rounded-none text-sm',
                          contextSubTab === 'webFetch' && 'btn-active',
                        )}
                        onClick={() => setContextSubTab('webFetch')}
                      >
                        {t('lists.contextSources.webFetch')}
                      </button>
                    </nav>

                    {/* Sub-Tab Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                      <div className={twMerge('', contextSubTab !== 'fields' && 'hidden')}>
                        <ReferencedFields list={list} fieldId={fieldId} fieldReferences={fieldReferences} />
                      </div>
                      <div className={twMerge(contextSubTab !== 'similarity' && 'hidden')}>
                        <SimilarContent vectorSearches={vectorSearches} />
                      </div>
                      <div className={twMerge(contextSubTab !== 'webFetch' && 'hidden')}>
                        <WebFetch webFetches={webFetches} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="modal-action shrink-0">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => handleCloseModal()}
              disabled={addFieldMutation.isPending || updateFieldMutation.isPending}
            >
              {t('actions.cancel')}
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={addFieldMutation.isPending || updateFieldMutation.isPending}
            >
              {(addFieldMutation.isPending || updateFieldMutation.isPending) && (
                <span className="loading loading-spinner loading-sm" />
              )}
              {isEditMode ? t('lists.fields.updateField') : t('lists.fields.addField')}
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
    </dialog>
  )
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import React, { useEffect, useId, useMemo, useState } from 'react'
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
import {
  ContextSource,
  ContextSourceList,
  apiFormatToContextSources,
  contextSourcesToApiFormat,
} from './context-source-list'
import { addListFieldFn, updateListFieldFn } from './server-functions'

export const getListFieldFormSchema = (
  editMode: 'update' | 'create',
  language: Language,
  contentQueryEnabled: boolean,
) =>
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
    contentQuery: contentQueryEnabled
      ? z
          .string()
          .transform((val) => val?.trim() || '')
          .refine((val) => val.length >= 2, translate('lists.fields.contentQueryTooShort', language))
          .refine((val) => val.length <= 100, translate('lists.fields.contentQueryTooLong', language))
      : z
          .string()
          .optional()
          .transform((val) => val?.trim() || null),
    order: z.string().optional(),
    fileProperty: z.string().optional(),
    useVectorStore: z
      .string()
      .optional()
      .transform((val) => val === 'on'),
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
    contentQuery
    languageModel {
      id
      provider
      name
    }
    useVectorStore
    order
    context {
      id
      contextFieldId
      contextQuery
      maxContentTokens
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
  const [activeTab, setActiveTab] = useState<'instruction' | 'context' | 'missing'>('value')
  const availableFields = useMemo(() => list.fields || [], [list.fields])

  const isEditMode = useMemo(() => !!editField, [editField])

  const handleCloseModal = () => {
    setActiveTab('instruction')
    ref.current?.close()
  }

  // State for context sources
  const [contextSources, setContextSources] = useState<ContextSource[]>([])

  // Initialize context sources from editField
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (editField?.context && editField.context.length > 0) {
        setContextSources(apiFormatToContextSources(editField.context, availableFields))
      } else {
        setContextSources([])
      }
    }, 0)
    return () => clearTimeout(timeoutId)
  }, [editField, availableFields])

  // State for vector store checkbox
  const [contentQueryEnabled, setContentQueryEnabled] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setContentQueryEnabled(!!editField?.useVectorStore)
    }, 100) // slight delay to ensure checkbox state updates correctly when modal opens in edit mode
    return () => clearTimeout(timeout)
  }, [editField])

  const schema = useMemo(
    () => getListFieldFormSchema(isEditMode ? 'update' : 'create', language, contentQueryEnabled),
    [isEditMode, language, contentQueryEnabled],
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
    // Add context sources from state
    const dataWithContextSources = {
      ...data,
      contextSources: contextSources.length > 0 ? contextSourcesToApiFormat(contextSources) : undefined,
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

  //DEV ONLY
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setActiveTab('context')
    }, 0)
    return () => clearTimeout(timeoutId)
  }, [])

  return (
    <dialog ref={ref} className="modal">
      <div className="modal-box flex h-[80vh] max-h-[800px] w-11/12 max-w-3xl flex-col">
        <h3 className="mb-4 shrink-0 text-lg font-bold">
          {t(isEditMode ? 'lists.fields.editTitle' : 'lists.fields.addTitle')}
        </h3>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          {/* Hidden Fields */}
          <input type="hidden" name="id" value={editField?.id || ''} />
          <input type="hidden" name="listId" value={list.id} />
          <input type="hidden" name="sourceType" value="llm_computed" />
          <input type="hidden" name="order" value={editField?.order?.toString() || (maxOrder + 1).toString()} />

          <div className="flex min-h-0 flex-1 flex-col gap-4">
            {/* Field Name - Always Visible */}
            <div className="flex shrink-0 gap-2">
              <div className="grow">
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
              <div className="z-50 w-48 shrink-0">
                <Select
                  label={t('lists.fields.dataType')}
                  name="type"
                  options={dataTypeOptions}
                  value={dataTypeOptions.find((option) => option.id === editField?.type) || dataTypeDefaultOptions}
                  schema={schema}
                  required
                />
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col">
              {/* Tabs - Horizontal with Radio Controls */}
              <div role="tablist" className="tabs tabs-border min-h-0 shrink-0">
                <input
                  type="radio"
                  name={tablistName}
                  className="tab"
                  aria-label={t('lists.fields.stepWhat')}
                  checked={activeTab === 'instruction'}
                  onClick={() => setActiveTab('instruction')}
                />
                <input
                  type="radio"
                  name={tablistName}
                  className="tab"
                  checked={activeTab === 'context'}
                  aria-label={t('lists.fields.stepWhere')}
                  onClick={() => setActiveTab('context')}
                />
                <input
                  type="radio"
                  name={tablistName}
                  className="tab"
                  checked={activeTab === 'missing'}
                  aria-label={t('lists.fields.stepFailure')}
                  onClick={() => setActiveTab('missing')}
                />
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className={twMerge('border-base-300 bg-base-100 p-6', activeTab !== 'instruction' && 'hidden')}>
                  <div className="flex flex-col gap-4">
                    <ModelSelect
                      name="languageModelId"
                      value={editField?.languageModel || null}
                      placeholder={t('lists.fields.selectAiModel')}
                      capability="chat"
                      className="[&_summary.btn]:btn-sm w-full text-sm"
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

                    {/* Vector Store Search */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('lists.fields.searchInDocuments')}</label>
                      <div>
                        <span className="text-base-content/60 mb-2 block text-xs">
                          {t('lists.fields.contentQueryHelp')}
                        </span>
                      </div>
                      <div className="flex w-full items-center gap-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            name="useVectorStore"
                            value="on"
                            className="checkbox checkbox-sm"
                            defaultChecked={editField?.useVectorStore || false}
                            onChange={(e) => setContentQueryEnabled(e.target.checked)}
                          />
                          <span className="truncate text-xs" title={t('lists.fields.useVectorStoreHelp')}>
                            {t('lists.fields.vectorStoreLabel')}
                          </span>
                        </label>
                        <input
                          type="text"
                          name="contentQuery"
                          className={twMerge(
                            'input input-sm flex-1',
                            !contentQueryEnabled && 'bg-base-300 text-base-content/50',
                          )}
                          placeholder={t('lists.fields.contentQueryPlaceholder')}
                          defaultValue={editField?.contentQuery || ''}
                          readOnly={!contentQueryEnabled}
                          required={contentQueryEnabled}
                          aria-label={t('lists.fields.contentQueryPlaceholder')}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className={twMerge('border-base-300 bg-base-100 p-6', activeTab !== 'context' && 'hidden')}>
                  <div className="flex h-full min-h-0 flex-col gap-4">
                    {/* Context Sources */}
                    <div className="flex min-h-0 flex-1 flex-col gap-2">
                      <label className="shrink-0 text-sm font-medium">{t('lists.fields.addContextSources')}</label>
                      <ContextSourceList
                        value={contextSources}
                        onChange={setContextSources}
                        availableFields={availableFields}
                        excludeFieldId={editField?.id}
                      />
                      <span className="text-base-content/60 shrink-0 text-xs">{t('lists.contextSources.help')}</span>
                    </div>
                  </div>
                </div>

                <div className={twMerge('border-base-300 bg-base-100 p-6', activeTab !== 'missing' && 'hidden')}>
                  <Input
                    label={t('lists.fields.failureTerms')}
                    type="text"
                    name="failureTerms"
                    placeholder={t('lists.fields.failureTermsPlaceholder')}
                    value={editField?.failureTerms || ''}
                    schema={schema}
                    required={false}
                  />
                  <div className="mt-1">
                    <span className="text-base-content/60 text-xs">{t('lists.fields.failureTermsHelp')}</span>
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

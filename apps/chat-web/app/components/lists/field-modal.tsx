import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
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
import { Select } from '../form/select'
import { toastError, toastSuccess } from '../georgeToaster'
import { getChatModelsQueryOptions } from '../model/get-models'
import { addListField, updateListField } from './server-functions'

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
    languageModel: z.string().nonempty(translate('lists.fields.languageModelRequired', language)),
    prompt: z
      .string()
      .min(10, translate('lists.fields.promptTooShort', language))
      .max(2000, translate('lists.fields.promptTooLong', language)),
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
    context: z
      .string()
      .optional()
      .transform((commaSeparatedList) => commaSeparatedList && commaSeparatedList.split(','))
      .pipe(z.array(z.string()).optional()),
  })

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
    contentQuery
    languageModel
    useVectorStore
    order
    context {
      contextFieldId
    }
  }
`)

interface FieldModalProps {
  list: FieldModal_ListFragment
  isOpen: boolean
  onClose: () => void
  maxOrder: number
  editField?: FieldModal_FieldFragment | null
}

export const FieldModal = ({ list, isOpen, onClose, maxOrder, editField }: FieldModalProps) => {
  const queryClient = useQueryClient()
  const { t, language } = useTranslation()

  // Query available AI chat models
  const { data: aiModelsData } = useSuspenseQuery(getChatModelsQueryOptions())

  const availableModels = aiModelsData?.aiChatModels || []
  const availableFields = list.fields || []

  // Get current context field IDs for edit mode
  const currentContextIds = useMemo(() => editField?.context?.map((c) => c.contextFieldId) || [], [editField])

  const isEditMode = useMemo(() => !!editField, [editField])

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
    mutationFn: async (formData: FormData) => {
      return await addListField({ data: formData })
    },
    onSuccess: (data) => {
      // Show success toast with field name
      toastSuccess(t('lists.fields.addSuccess', { name: data.addListField.name }))

      // Invalidate queries to refetch list data
      queryClient.invalidateQueries({ queryKey: ['AiList', { listId: list.id }] })
      onClose()
    },
  })

  const updateFieldMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await updateListField({ data: formData })
    },
    onSuccess: ({ updateListField }) => {
      // Show success toast with field name
      toastSuccess(t('lists.fields.updateSuccess', { name: updateListField.name }))

      // Invalidate queries to refetch list data
      queryClient.invalidateQueries({ queryKey: ['AiList', { listId: list.id }] })
      onClose()
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const { formData, errors } = validateForm(e.currentTarget, schema)
    if (errors) {
      toastError(errors.map((error) => <div key={error}>{error}</div>))
      return
    }
    if (isEditMode) {
      updateFieldMutation.mutate(formData)
    } else {
      addFieldMutation.mutate(formData)
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

  if (!isOpen) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-2xl">
        <h3 className="mb-4 text-lg font-bold">{t(isEditMode ? 'lists.fields.editTitle' : 'lists.fields.addTitle')}</h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hidden Fields */}
          <input type="hidden" name="id" value={editField?.id || ''} />
          <input type="hidden" name="listId" value={list.id} />
          <input type="hidden" name="sourceType" value="llm_computed" />
          <input type="hidden" name="order" value={editField?.order?.toString() || (maxOrder + 1).toString()} />

          {/* Grid Layout for Form Fields */}
          <div className="items-start gap-4">
            <div className="flex items-baseline gap-2">
              <Input
                label={t('lists.fields.fieldName')}
                type="text"
                name="name"
                placeholder={t('lists.fields.fieldNamePlaceholder')}
                value={editField?.name}
                schema={schema}
                className="flex-1"
              />
              <Select
                label={t('lists.fields.dataType')}
                name="type"
                options={dataTypeOptions}
                value={dataTypeOptions.find((option) => option.id === editField?.type) || dataTypeDefaultOptions}
                schema={schema}
                required
              />

              <Select
                label={t('lists.fields.aiModel')}
                name="languageModel"
                options={availableModels.map((model) => ({ id: model, name: model }))}
                value={availableModels
                  .map((model) => ({ id: model, name: model }))
                  .find((model) => model.id === editField?.languageModel)}
                placeholder={t('lists.fields.selectAiModel')}
                schema={schema}
                required
              />
            </div>

            <div className="md:col-span-4">
              <Input
                label={t('lists.fields.aiPrompt')}
                type="textarea"
                name="prompt"
                placeholder={t('lists.fields.aiPromptPlaceholder')}
                value={editField?.prompt}
                schema={schema}
                required
                className="h-44"
              />
              <div className="mt-1">
                <span className="text-base-content/60 text-xs">{t('lists.fields.aiPromptHelp')}</span>
              </div>
            </div>

            {/* Context Fields */}
            <div className="fieldset-legend mb-2 flex w-full justify-between">
              <span className="text-xs">{t('lists.fields.contextFields')}</span>
            </div>
            <div className="md:col-span-3">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <div className="sm:col-span-2">
                    <span className="text-base-content/60 text-xs">{t('lists.fields.contentQueryHelp')}</span>
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
                {availableFields
                  .filter((field) => field.id !== editField?.id) // Don't allow self-reference
                  .map((field) => (
                    <label key={field.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="context"
                        value={field.id}
                        className="checkbox checkbox-sm"
                        defaultChecked={currentContextIds.includes(field.id)}
                      />
                      <span className="truncate text-xs" title={field.name}>
                        {field.name} (
                        {field.sourceType === 'file_property'
                          ? t('lists.fields.fileProperty')
                          : t('lists.fields.computed')}
                        )
                      </span>
                    </label>
                  ))}
              </div>
              <div className="mt-1">
                <span className="text-base-content/60 text-xs">{t('lists.fields.contextFieldsHelp')}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onClose}
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
    </div>
  )
}

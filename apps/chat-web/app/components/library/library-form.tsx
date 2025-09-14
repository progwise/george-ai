import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import React, { useMemo } from 'react'
import { twMerge } from 'tailwind-merge'

import { graphql } from '../../gql'
import { AiLibraryForm_LibraryFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { ReprocessIcon } from '../../icons/reprocess-icon'
import { SaveIcon } from '../../icons/save-icon'
import { Input } from '../form/input'
import { Select } from '../form/select'
import { toastError } from '../georgeToaster'
import { LoadingSpinner } from '../loading-spinner'
import { getChatModelsQueryOptions, getEmbeddingModelsQueryOptions } from '../model/get-models'
import { getLibrariesQueryOptions } from './get-libraries'
import { getLibraryQueryOptions } from './get-library'
import { getLibraryUpdateFormSchema, updateLibrary } from './update-library'

graphql(`
  fragment AiLibraryForm_Library on AiLibrary {
    id
    name
    embeddingTimeoutMs
    ownerId
    filesCount
    description
    embeddingModelName
    fileConverterOptions
  }
`)

export interface LibraryEditFormProps {
  library: AiLibraryForm_LibraryFragment
}

export const LibraryForm = ({ library }: LibraryEditFormProps): React.ReactElement => {
  const { t, language } = useTranslation()
  const queryClient = useQueryClient()
  const formRef = React.useRef<HTMLFormElement>(null)
  const fileConverterOptionsRef = React.useRef<HTMLInputElement>(null)

  const schema = React.useMemo(() => getLibraryUpdateFormSchema(language), [language])

  const {
    data: { aiEmbeddingModels },
  } = useSuspenseQuery(getEmbeddingModelsQueryOptions())

  const {
    data: { aiChatModels },
  } = useSuspenseQuery(getChatModelsQueryOptions())

  const { mutate: saveLibrary, isPending: saveIsPending } = useMutation({
    mutationFn: (data: FormData) => updateLibrary({ data }),
    onError: (error) => {
      toastError(t('toasts.saveError', { error: error.message }))
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries(getLibrariesQueryOptions()),
        queryClient.invalidateQueries(getLibraryQueryOptions(library.id)),
      ])
    },
  })

  const fieldProps = {
    schema,
  }

  const mappedEmbeddingModels = useMemo(
    () =>
      aiEmbeddingModels.map((model) => ({
        id: model,
        name: model,
      })),
    [aiEmbeddingModels],
  )

  const mappedChatModels = useMemo(
    () =>
      aiChatModels.map((model) => ({
        id: model,
        name: model,
      })),
    [aiChatModels],
  )

  // Parse current file converter options
  const currentOptions = library.fileConverterOptions ? library.fileConverterOptions.split(',') : []
  const isImageProcessingEnabled = currentOptions.includes('enableImageProcessing')

  // Helper to parse option values
  const parseOptionValue = (optionName: string, defaultValue: string = '') => {
    if (!library.fileConverterOptions) return defaultValue
    const pairs = library.fileConverterOptions.split(',').map((pair) => pair.trim())
    for (const pair of pairs) {
      const [key, value] = pair.split('=', 2)
      if (key?.trim() === optionName && value !== undefined) {
        const trimmedValue = decodeURIComponent(value.trim())
        // Return default if the stored value is empty
        return trimmedValue || defaultValue
      }
    }
    return defaultValue
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    saveLibrary(formData)
  }

  const handleReset = () => {
    if (formRef.current) {
      // Reset form to original library values
      formRef.current.reset()

      // Reset the hidden file converter options field to original value
      if (fileConverterOptionsRef.current) {
        fileConverterOptionsRef.current.value = library.fileConverterOptions ?? ''
      }
    }
  }

  const changeFileConverterOptions = (optionName: string, optionValue: string | boolean) => {
    const currentOptions = fileConverterOptionsRef.current?.value
      ? fileConverterOptionsRef.current.value.split(',').map((opt) => opt.trim())
      : []
    const optionIndex = currentOptions.findIndex(
      (opt) => opt.trim().startsWith(optionName + '=') || opt.trim() === optionName,
    )

    if (optionValue === '' || optionValue === false) {
      // Remove the option if it exists
      if (optionIndex !== -1) {
        currentOptions.splice(optionIndex, 1)
      }
    } else {
      const newOption = optionValue === true ? `${optionName}` : `${optionName}=${encodeURIComponent(optionValue)}`
      if (optionIndex !== -1) {
        currentOptions[optionIndex] = newOption
      } else {
        currentOptions.push(newOption)
      }
    }

    const newOptionsString = currentOptions.join(',')
    if (fileConverterOptionsRef.current) {
      fileConverterOptionsRef.current.value = newOptionsString
    }
  }

  return (
    <form id={library.id} ref={formRef} className="mx-auto max-w-4xl space-y-6" onSubmit={(e) => handleSubmit(e)}>
      <LoadingSpinner isLoading={saveIsPending} />
      <input type="hidden" name="id" value={library.id || ''} />
      <input
        ref={fileConverterOptionsRef}
        type="hidden"
        name="fileConverterOptions"
        value={library.fileConverterOptions ?? ''}
      />

      {/* Basic Information Card */}
      <div className="card bg-base-100 shadow-md">
        <div className="card-title flex items-center justify-between px-6 pt-4">
          <h2 className="card-title mb-4 text-xl">{t('labels.basicInformation')}</h2>

          <ul className="menu bg-base-200 lg:menu-horizontal rounded-box gap-x-2">
            <li>
              <button type="submit" className="btn btn-ghost btn-primary btn-sm" disabled={saveIsPending}>
                <SaveIcon className="h-5 w-5" />
                Save
              </button>
            </li>
            <li>
              <button type="button" className="btn btn-sm btn-ghost btn-secondary" onClick={handleReset}>
                <ReprocessIcon className="h-5 w-5" />
                Reset
              </button>
            </li>
          </ul>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            {/* Library Name */}
            <Input
              name="name"
              type="text"
              label={t('labels.name')}
              value={library.name}
              className="col-span-2"
              required
              {...fieldProps}
            />

            <Input
              name="description"
              type="textarea"
              label={t('labels.description')}
              value={library.description || ''}
              className="col-span-2"
              {...fieldProps}
            />
          </div>
        </div>
      </div>

      {/* Embedding Model Configuration Card */}
      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h2 className="card-title mb-4 text-xl">{t('labels.libraryProcessingOptions')}</h2>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Select
              name="embeddingModelName"
              label={t('labels.embeddingModelName')}
              options={mappedEmbeddingModels}
              value={mappedEmbeddingModels.find((model) => model.id === library.embeddingModelName)}
              className="col-span-1"
              placeholder={t('libraries.placeholders.embeddingModelName')}
              {...fieldProps}
            />

            <Input
              name="embeddingTimeoutMs"
              type="number"
              label={t('labels.embeddingTimeoutMs')}
              value={library.embeddingTimeoutMs?.toString() || '180000'}
              className="col-span-1"
              placeholder={t('libraries.placeholders.embeddingTimeoutMs')}
              {...fieldProps}
            />
          </div>
        </div>
      </div>
      {/* File Processing Options Card */}
      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h2 className="card-title mb-4 text-xl">{t('labels.fileConverterOptions')}</h2>

          <div className="space-y-6">
            {/* PDF Processing Options */}
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
              <legend className="fieldset-legend">{t('labels.fileConverterOptions')}</legend>

              <div className="space-y-4">
                {/* Enable Text Extraction */}
                <label className="label cursor-pointer justify-start">
                  <input
                    name="enableTextExtraction"
                    type="checkbox"
                    className="checkbox checkbox-sm mr-3"
                    defaultChecked={currentOptions.includes('enableTextExtraction')}
                    onChange={(e) =>
                      changeFileConverterOptions('enableTextExtraction', e.target.checked ? true : false)
                    }
                  />
                  <div>
                    <span className="text-sm font-medium">{t('labels.enableTextExtraction')}</span>
                    <p className="mt-1 text-xs text-gray-600">{t('labels.textExtractionDescription')}</p>
                  </div>
                </label>

                {/* Enable Image OCR Processing */}
                <label className="label cursor-pointer justify-start">
                  <input
                    name="enableImageProcessing"
                    type="checkbox"
                    className="checkbox checkbox-sm mr-3"
                    defaultChecked={isImageProcessingEnabled}
                    onChange={(e) =>
                      changeFileConverterOptions('enableImageProcessing', e.target.checked ? true : false)
                    }
                  />
                  <div>
                    <span className="text-sm font-medium">{t('labels.enableImageOcrProcessing')}</span>
                    <p className="mt-1 text-xs text-gray-600">{t('labels.imageOcrProcessingDescription')}</p>
                  </div>
                </label>

                {/* OCR Settings - Always visible but readonly when Image OCR is off */}
                <div className="border-primary ml-6 space-y-4 border-l-2 pl-4">
                  <h4
                    className={twMerge(
                      'text-primary text-sm font-medium',
                      !isImageProcessingEnabled && 'text-base-content/50',
                    )}
                  >
                    {t('labels.ocrSettings')}
                  </h4>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {/* OCR Prompt */}
                    <Input
                      name="ocrPrompt"
                      type="textarea"
                      label={t('labels.ocrPrompt')}
                      value={parseOptionValue(
                        'ocrPrompt',
                        'Please give me the content of this image as markdown structured as follows:\nShort summary what you see in the image\nList all visual blocks with a headline and its content\nReturn plain and well structured Markdown. Do not repeat information.',
                      )}
                      className="col-span-2 [&_textarea]:min-h-32"
                      placeholder={t('labels.ocrPromptPlaceholder')}
                      readonly={!isImageProcessingEnabled}
                      {...fieldProps}
                      onBlur={(e) => {
                        changeFileConverterOptions('ocrPrompt', e.target.value)
                      }}
                    />

                    {/* OCR Model */}
                    <Select
                      name="ocrModel"
                      label={t('labels.ocrModel')}
                      options={mappedChatModels}
                      value={mappedChatModels.find(
                        (model) => model.id === parseOptionValue('ocrModel', 'qwen2.5vl:latest'),
                      )}
                      className="col-span-2 lg:col-span-1"
                      placeholder={t('labels.ocrModelPlaceholder')}
                      readonly={!isImageProcessingEnabled}
                      {...fieldProps}
                      onBlur={(item) => {
                        changeFileConverterOptions('ocrModel', item?.id || '')
                      }}
                    />

                    {/* OCR Timeout */}
                    <Input
                      name="ocrTimeout"
                      type="number"
                      label={t('labels.ocrTimeout')}
                      value={parseOptionValue('ocrTimeout', '120')}
                      className="col-span-1"
                      readonly={!isImageProcessingEnabled}
                      {...fieldProps}
                      onBlur={() => {
                        changeFileConverterOptions('ocrTimeout', formRef.current?.ocrTimeout.value || '120')
                      }}
                    />

                    <Input
                      name="ocrImageScale"
                      type="number"
                      label={t('labels.ocrImageScale')}
                      value={parseOptionValue('ocrImageScale', '1.5')}
                      className="col-span-1"
                      readonly={!isImageProcessingEnabled}
                      {...fieldProps}
                      onBlur={() => {
                        changeFileConverterOptions('ocrImageScale', formRef.current?.ocrImageScale.value || '1.5')
                      }}
                    />
                    <Input
                      name="ocrMaxConsecutiveRepeats"
                      type="number"
                      label={t('labels.ocrMaxConsecutiveRepeats')}
                      value={parseOptionValue('ocrMaxConsecutiveRepeats', '5')}
                      className="col-span-1"
                      readonly={!isImageProcessingEnabled}
                      {...fieldProps}
                      onBlur={() => {
                        changeFileConverterOptions(
                          'ocrMaxConsecutiveRepeats',
                          formRef.current?.ocrMaxConsecutiveRepeats.value || '5',
                        )
                      }}
                    />
                  </div>
                </div>
              </div>
            </fieldset>
          </div>
        </div>
      </div>
    </form>
  )
}

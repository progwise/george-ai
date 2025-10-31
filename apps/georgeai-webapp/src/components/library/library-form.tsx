import { useSuspenseQuery } from '@tanstack/react-query'
import React, { useMemo } from 'react'
import { twMerge } from 'tailwind-merge'

import { graphql } from '../../gql'
import { AiLibraryForm_LibraryFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { ReprocessIcon } from '../../icons/reprocess-icon'
import { SaveIcon } from '../../icons/save-icon'
import { Input } from '../form/input'
import { Select } from '../form/select'
import { LoadingSpinner } from '../loading-spinner'
import { getChatModelsQueryOptions, getEmbeddingModelsQueryOptions } from '../model/get-models'
import { ApiKeysCard } from './api-keys-card'
import { getLibraryUpdateFormSchema } from './server-functions/update-library'
import { useLibraryActions } from './use-library-actions'

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
    autoProcessCrawledFiles
  }
`)

export interface LibraryEditFormProps {
  library: AiLibraryForm_LibraryFragment
}

export const LibraryForm = ({ library }: LibraryEditFormProps): React.ReactElement => {
  const { t, language } = useTranslation()
  const formRef = React.useRef<HTMLFormElement>(null)
  const fileConverterOptionsRef = React.useRef<HTMLInputElement>(null)

  const { updateLibrary, isPending } = useLibraryActions(library.id)

  const schema = React.useMemo(() => getLibraryUpdateFormSchema(language), [language])

  const {
    data: { aiEmbeddingModels },
  } = useSuspenseQuery(getEmbeddingModelsQueryOptions())

  const {
    data: { aiChatModels },
  } = useSuspenseQuery(getChatModelsQueryOptions())

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
    updateLibrary(formData)
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
    <div className="grid h-full w-full grid-rows-[auto_1fr] gap-4">
      <div className="flex justify-end">
        <ul className="menu menu-xs md:menu-horizontal bg-base-200 rounded-box flex-nowrap shadow-lg">
          <li>
            <button type="submit" form={library.id} disabled={isPending}>
              <SaveIcon className="h-5 w-5" />
              {t('actions.save')}
            </button>
          </li>
          <li>
            <button type="button" onClick={handleReset}>
              <ReprocessIcon className="h-5 w-5" />
              {t('actions.cancel')}
            </button>
          </li>
        </ul>
      </div>
      <div className="h-full w-full overflow-auto">
        <form id={library.id} ref={formRef} onSubmit={(e) => handleSubmit(e)} className="flex flex-col gap-4">
          <LoadingSpinner isLoading={isPending} />
          <input type="hidden" name="id" value={library.id || ''} />
          <input
            ref={fileConverterOptionsRef}
            type="hidden"
            name="fileConverterOptions"
            value={library.fileConverterOptions ?? ''}
          />

          {/* Basic Information Card */}
          <div className="collapse-arrow bg-base-100 collapse shadow-md">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-xl font-medium">{t('labels.basicInformation')}</div>
            <div className="collapse-content">
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
          <div className="collapse-arrow bg-base-100 collapse shadow-md">
            <input type="checkbox" />
            <div className="collapse-title text-xl font-medium">{t('labels.libraryProcessingOptions')}</div>
            <div className="collapse-content">
              <div className="space-y-4">
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

                {/* Auto-process crawled files option */}
                <div className="mt-4">
                  <label className="label cursor-pointer justify-start">
                    <input
                      name="autoProcessCrawledFiles"
                      type="checkbox"
                      className="checkbox checkbox-sm mr-3"
                      defaultChecked={library.autoProcessCrawledFiles}
                    />
                    <div>
                      <span className="text-sm font-medium">Auto-process hash-skipped crawled files</span>
                      <p className="mt-1 whitespace-normal break-words text-xs text-gray-600">
                        Automatically create content extraction tasks for files skipped during crawling due to unchanged
                        content (hash equality), but only if they have no successful or pending processing task. Note:
                        Uploaded files and new/updated crawled files always get tasks automatically.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
          {/* File Processing Options Card */}
          <div className="collapse-arrow bg-base-100 collapse shadow-md">
            <input type="checkbox" />
            <div className="collapse-title text-xl font-medium">{t('labels.fileConverterOptions')}</div>
            <div className="collapse-content">
              <div className="space-y-6">
                {/* PDF Processing Options */}
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
              </div>
            </div>
          </div>
        </form>
        <div className="collapse-arrow bg-base-100 collapse mb-2 mt-4 shadow-md">
          <input type="checkbox" />
          <div className="collapse-title text-xl font-medium">{t('apiKeys.title')}</div>
          <div className="collapse-content">
            <ApiKeysCard libraryId={library.id} />
          </div>
        </div>
      </div>
    </div>
  )
}

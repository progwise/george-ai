import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import React, { useMemo } from 'react'

import { AiFileConverterOptionsQuery, AiLibraryDetailFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { Input } from '../form/input'
import { Select } from '../form/select'
import { toastError } from '../georgeToaster'
import { LoadingSpinner } from '../loading-spinner'
import { getEmbeddingModelsQueryOptions } from '../model/get-models'
import { getFileConverterOptionsOptions } from './get-file-converter-options'
import { getLibrariesQueryOptions } from './get-libraries'
import { getLibraryQueryOptions } from './get-library'
import { getLibraryUpdateFormSchema, updateLibrary } from './update-library'

export interface LibraryEditFormProps {
  library: AiLibraryDetailFragment
}

// Type helper to extract file converter option keys
type FileConverterOptionKeys = Exclude<keyof AiFileConverterOptionsQuery['aiFileConverterOptions'], '__typename'>

export const LibraryForm = ({ library }: LibraryEditFormProps): React.ReactElement => {
  const { t, language } = useTranslation()
  const queryClient = useQueryClient()
  const formRef = React.useRef<HTMLFormElement>(null)
  const fileConverterOptionsRef = React.useRef<HTMLInputElement>(null)

  const schema = React.useMemo(() => getLibraryUpdateFormSchema(language), [language])

  const {
    data: { aiEmbeddingModels },
  } = useSuspenseQuery(getEmbeddingModelsQueryOptions())
  const { mutate: saveLibrary, isPending: saveIsPending } = useMutation({
    mutationFn: (data: FormData) => updateLibrary({ data }),
    onSettled: () => {
      queryClient.invalidateQueries(getLibrariesQueryOptions())
      queryClient.invalidateQueries(getLibraryQueryOptions(library.id))
    },
  })

  const {
    data: { aiFileConverterOptions },
  } = useSuspenseQuery(getFileConverterOptionsOptions())

  const fieldProps = {
    schema,
    onBlur: () => {
      const formData = new FormData(formRef.current!)
      const parseResult = schema.safeParse(Object.fromEntries(formData))
      if (parseResult.success) {
        saveLibrary(formData)
      } else {
        toastError(
          <>
            {t('errors.validationFailed')}
            <ul>
              {parseResult.error.errors.map((error) => (
                <li key={error.path.join('.')}>{error.message}</li>
              ))}
            </ul>
          </>,
        )
      }
    },
  }

  const mappedEmbeddingModels = useMemo(
    () =>
      aiEmbeddingModels.map((model) => ({
        id: model.model,
        name: model.name,
      })),
    [aiEmbeddingModels],
  )

  const handleFileTypeOptionChange = (optionName: string, value: boolean) => {
    const currentOptions = library.fileConverterOptions ? library.fileConverterOptions.split(',') : []
    if (value) {
      currentOptions.push(optionName)
    } else {
      const index = currentOptions.indexOf(optionName)
      if (index > -1) {
        currentOptions.splice(index, 1)
      }
    }
    if (!fileConverterOptionsRef.current) return
    fileConverterOptionsRef.current.value = currentOptions.join(',')
    saveLibrary(new FormData(formRef.current!))
  }

  // Type-safe keys from the GraphQL response
  const fileConverterOptionKeys = Object.keys(aiFileConverterOptions) as FileConverterOptionKeys[]

  return (
    <form id={library.id} ref={formRef} className="mx-auto max-w-4xl space-y-6">
      <LoadingSpinner isLoading={saveIsPending} />
      <input type="hidden" name="id" value={library.id || ''} />
      <input
        type="hidden"
        name="fileConverterOptions"
        ref={fileConverterOptionsRef}
        value={library.fileConverterOptions || ''}
      />
      {/* Basic Information Card */}
      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h2 className="card-title mb-4 text-xl">{t('labels.basicInformation')}</h2>

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
          </div>
        </div>
      </div>
      <div className="car bg-base-100 shadow-md">
        <div className="card-body">
          <h2 className="card-title text-xl">{t('labels.fileConverterOptions')}</h2>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {fileConverterOptionKeys.map((key) => {
              const section = aiFileConverterOptions[key]
              return (
                <fieldset key={key} className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
                  <legend className="fieldset-legend flex w-full justify-between">{section.title[language]}</legend>
                  {section.settings.map((option) => (
                    <label key={option.name} className="label">
                      <input
                        type="checkbox"
                        checked={
                          library.fileConverterOptions
                            ? library.fileConverterOptions.split(',').includes(option.name)
                            : false
                        }
                        className="checkbox checkbox-sm"
                        onChange={(event) => handleFileTypeOptionChange(option.name, event.currentTarget.checked)}
                      />
                      <div>
                        <span className="text-sm font-medium">{option.label[language]}</span>
                        <p className="mt-1 text-xs">{option.description[language]}</p>
                      </div>
                    </label>
                  ))}
                </fieldset>
              )
            })}
          </div>
        </div>
      </div>
    </form>
  )
}

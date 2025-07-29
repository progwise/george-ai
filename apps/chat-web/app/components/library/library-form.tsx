import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import React, { useMemo } from 'react'

import { AiLibraryDetailFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { Input } from '../form/input'
import { Select } from '../form/select'
import { toastError } from '../georgeToaster'
import { LoadingSpinner } from '../loading-spinner'
import { getEmbeddingModelsQueryOptions } from '../model/get-models'
import { getLibrariesQueryOptions } from './get-libraries'
import { getLibraryQueryOptions } from './get-library'
import { getLibraryUpdateFormSchema, updateLibrary } from './update-library'

export interface LibraryEditFormProps {
  library: AiLibraryDetailFragment
}

export const LibraryForm = ({ library }: LibraryEditFormProps): React.ReactElement => {
  const { t, language } = useTranslation()
  const queryClient = useQueryClient()
  const formRef = React.useRef<HTMLFormElement>(null)

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
        id: model.modelName,
        name: model.modelName,
        type: model.type,
      })),
    [aiEmbeddingModels],
  )

  return (
    <form id={library.id} ref={formRef} className="mx-auto max-w-4xl space-y-6">
      <LoadingSpinner isLoading={saveIsPending} />
      <input type="hidden" name="id" value={library.id || ''} />
      <input type="hidden" name="embeddingProvider" value={library.embedding?.provider || 'Ollama'} />
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
          <h2 className="card-title mb-4 text-xl">{t('labels.embeddingModelConfiguration')}</h2>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Select
              name="embeddingModel"
              label={t('labels.embeddingModel')}
              options={mappedEmbeddingModels}
              value={mappedEmbeddingModels.find((model) => model.id === library.embedding?.model)}
              className="col-span-1"
              placeholder={t('libraries.placeholders.embeddingModel')}
              {...fieldProps}
            />

            {/* URL Configuration */}
            <Input
              name="embeddingUrl"
              type="text"
              label={t('labels.embeddingUrl')}
              value={library.embedding?.url || ''}
              className="col-span-1"
              placeholder={t('libraries.placeholders.embeddingUrl')}
              {...fieldProps}
            />

            {/* Options spans full width */}
            <Input
              name="embeddingOptions"
              type="text"
              label={t('labels.embeddingOptions')}
              value={library.embedding?.options || ''}
              className="col-span-2"
              placeholder={t('libraries.placeholders.embeddingOptions')}
              {...fieldProps}
            />
          </div>
        </div>
      </div>
    </form>
  )
}

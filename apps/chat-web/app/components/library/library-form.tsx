import { useSuspenseQuery } from '@tanstack/react-query'
import React from 'react'

import { AiLibraryDetailFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { getEmbeddingModelsQueryOptions } from '../model/get-models'

export interface LibraryEditFormProps {
  library: AiLibraryDetailFragment
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  disabled: boolean
}

export const LibraryForm = ({ library, handleSubmit, disabled }: LibraryEditFormProps): React.ReactElement => {
  const { t } = useTranslation()
  const { data: embeddingModels } = useSuspenseQuery(getEmbeddingModelsQueryOptions())

  return (
    <div className="mx-auto max-w-4xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <input type="hidden" name="libraryId" value={library.id || ''} />

        {/* Basic Information Card */}
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title mb-4 text-xl">Basic Information</h2>

            <div className="space-y-4">
              {/* Library Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">{t('libraries.nameLibrary')}</span>
                  <span className="label-text-alt text-error">*</span>
                </label>
                <input
                  key={library.name}
                  name="name"
                  type="text"
                  defaultValue={library.name || ''}
                  className="input input-bordered focus:input-primary w-full"
                  placeholder={t('libraries.placeholders.name')}
                  required
                />
              </div>

              {/* Description */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Description</span>
                </label>
                <textarea
                  key={library.description}
                  name="description"
                  className="textarea textarea-bordered focus:textarea-primary h-24 w-full resize-none"
                  placeholder={t('libraries.placeholders.description')}
                  defaultValue={library.description || ''}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Embedding Model Configuration Card */}
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title mb-4 text-xl">Embedding Model Configuration</h2>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Model Selection */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Model</span>
                </label>
                <select
                  name="embeddingModel"
                  className="select select-bordered focus:select-primary w-full"
                  defaultValue={library.embedding?.model || ''}
                >
                  <option disabled value="">
                    Select an embedding model
                  </option>
                  {embeddingModels.aiEmbeddingModels?.map((model) => (
                    <option key={model.modelName} value={model.modelName}>
                      {model.title} ({model.type})
                    </option>
                  ))}
                </select>
                <span className="overflow-hidden text-neutral-400">Choose the AI model for document embeddings</span>
              </div>

              {/* URL Configuration */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Server URL</span>
                </label>
                <input
                  name="embeddingUrl"
                  type="url"
                  className="input input-bordered focus:input-primary w-full"
                  placeholder="http://ollama.george-ai.net:11434"
                  defaultValue={library.embedding?.url || ''}
                />
                <span className="overflow-hidden text-neutral-400">Leave empty to use default url</span>
              </div>

              {/* Options spans full width */}
              <div className="form-control lg:col-span-2">
                <label className="label">
                  <span className="label-text font-medium">Model Options</span>
                </label>
                <input
                  name="embeddingOptions"
                  type="text"
                  className="input input-bordered focus:input-primary w-full"
                  placeholder="temperature=0.7;maxTokens=80000"
                  defaultValue={library.embedding?.options || ''}
                />
                <span className="overflow-hidden text-neutral-400">
                  Semicolon-separated key=value pairs (e.g., temperature=0.7;maxTokens=80000)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end">
          <button disabled={disabled} type="submit" className="btn btn-primary">
            {disabled && <span className="loading loading-spinner loading-sm"></span>}
            {t('actions.save')}
          </button>
        </div>
      </form>
    </div>
  )
}

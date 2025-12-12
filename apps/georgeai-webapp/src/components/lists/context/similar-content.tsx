import { useEffect, useState } from 'react'

import { graphql } from '../../../gql'
import { SimilarContent_VectorSearchesFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'

graphql(`
  fragment SimilarContent_VectorSearches on AiListFieldContext {
    id
    contextQuery
    maxContentTokens
  }
`)

interface SimilarContentProps {
  vectorSearches: SimilarContent_VectorSearchesFragment[]
}

export const SimilarContent = ({ vectorSearches }: SimilarContentProps) => {
  const { t } = useTranslation()
  const [items, setItems] = useState(vectorSearches)
  const [newItems, setNewItems] = useState<string[]>([crypto.randomUUID()])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setItems(vectorSearches)
      setNewItems([crypto.randomUUID()])
    }, 100)
    return () => clearTimeout(timeout)
  }, [vectorSearches])

  const addNewItem = () => {
    setNewItems((prev) => [...prev, crypto.randomUUID()])
  }

  const removeNewItem = (index: number) => {
    setNewItems((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-base-content/60">{t('lists.contextSources.similarContentHelp')}</p>

      {/* Display existing vector searches with inline editing */}
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((search, index) => {
            const query = search.contextQuery ? JSON.parse(search.contextQuery) : {}
            return (
              <div key={search.id} className="rounded-sm bg-base-200 p-3">
                <input type="hidden" name={`vectorSearch_id_${index}`} value={search.id} />
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {t('lists.contextSources.vectorSearch')} #{index + 1}
                  </span>
                  <button
                    type="button"
                    className="btn text-error btn-ghost btn-xs"
                    onClick={() => {
                      setItems((prevItems) => prevItems.filter((_, i) => i !== index))
                    }}
                  >
                    {t('actions.delete')}
                  </button>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium">{t('lists.contextSources.queryTemplate')}</label>
                    <input
                      type="text"
                      name={`vectorSearch_queryTemplate_${index}`}
                      className="input input-sm w-full"
                      defaultValue={query.queryTemplate || ''}
                      placeholder={t('lists.contextSources.queryTemplatePlaceholder')}
                      aria-label={t('lists.contextSources.queryTemplate')}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium">{t('lists.contextSources.maxChunks')}</label>
                      <input
                        type="number"
                        name={`vectorSearch_maxChunks_${index}`}
                        className="input input-sm w-full"
                        defaultValue={query.maxChunks || 5}
                        min="1"
                        max="20"
                        step="1"
                        aria-label={t('lists.contextSources.maxChunks')}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium">{t('lists.contextSources.maxDistance')}</label>
                      <input
                        type="number"
                        name={`vectorSearch_maxDistance_${index}`}
                        className="input input-sm w-full"
                        defaultValue={query.maxDistance || 0.5}
                        min="0"
                        max="1"
                        step="0.05"
                        aria-label={t('lists.contextSources.maxDistance')}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium">{t('lists.contextSources.maxTokens')}</label>
                    <input
                      type="number"
                      name={`vectorSearch_maxTokens_${index}`}
                      className="input input-sm w-full"
                      defaultValue={search.maxContentTokens || 1000}
                      min="100"
                      max="10000"
                      step="100"
                      aria-label={t('lists.contextSources.vectorSearchMaxTokens')}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add new vector searches */}
      <div className="space-y-2">
        {newItems.map((itemId, newIndex) => (
          <div key={itemId} className="rounded-sm border border-base-300 bg-base-100 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-medium">
                {newIndex === 0
                  ? t('lists.contextSources.addVectorSearch')
                  : `${t('lists.contextSources.vectorSearch')} (${t('actions.new')})`}
              </h4>
              {newItems.length > 1 && (
                <button
                  type="button"
                  className="btn text-error btn-ghost btn-xs"
                  onClick={() => removeNewItem(newIndex)}
                >
                  {t('actions.delete')}
                </button>
              )}
            </div>

            <div className="space-y-3">
              {/* Query Template */}
              <div>
                <label className="mb-1 block text-xs font-medium">{t('lists.contextSources.queryTemplate')}</label>
                <input
                  type="text"
                  name={`vectorSearch_queryTemplate_new_${newIndex}`}
                  className="input input-sm w-full"
                  placeholder={t('lists.contextSources.queryTemplatePlaceholder')}
                  aria-label={t('lists.contextSources.queryTemplate')}
                />
                {newIndex === 0 && (
                  <p className="mt-1 text-xs text-base-content/60">{t('lists.contextSources.templateHelp')}</p>
                )}
              </div>

              {/* Max Chunks and Max Distance */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs font-medium">{t('lists.contextSources.maxChunks')}</label>
                  <input
                    type="number"
                    name={`vectorSearch_maxChunks_new_${newIndex}`}
                    className="input input-sm w-full"
                    placeholder="5"
                    min="1"
                    max="20"
                    step="1"
                    defaultValue="5"
                    aria-label={t('lists.contextSources.maxChunks')}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">{t('lists.contextSources.maxDistance')}</label>
                  <input
                    type="number"
                    name={`vectorSearch_maxDistance_new_${newIndex}`}
                    className="input input-sm w-full"
                    placeholder="0.5"
                    min="0"
                    max="1"
                    step="0.05"
                    defaultValue="0.5"
                    aria-label={t('lists.contextSources.maxDistance')}
                  />
                </div>
              </div>

              {/* Max Tokens */}
              <div>
                <label className="mb-1 block text-xs font-medium">{t('lists.contextSources.maxTokens')}</label>
                <input
                  type="number"
                  name={`vectorSearch_maxTokens_new_${newIndex}`}
                  className="input input-sm w-full"
                  placeholder="1000"
                  min="100"
                  max="10000"
                  step="100"
                  defaultValue="1000"
                  aria-label={t('lists.contextSources.vectorSearchMaxTokens')}
                />
              </div>
            </div>
          </div>
        ))}
        <button type="button" className="btn w-full btn-ghost btn-sm" onClick={addNewItem}>
          + {t('lists.contextSources.addVectorSearch')}
        </button>
      </div>

      {vectorSearches.length === 0 && (
        <p className="py-2 text-center text-sm text-base-content/50">{t('lists.contextSources.noVectorSearches')}</p>
      )}
    </div>
  )
}

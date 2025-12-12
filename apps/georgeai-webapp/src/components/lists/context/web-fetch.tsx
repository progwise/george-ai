import { useEffect, useState } from 'react'

import { graphql } from '../../../gql'
import { WebFetch_WebFetchesFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'

graphql(`
  fragment WebFetch_WebFetches on AiListFieldContext {
    id
    contextQuery
    maxContentTokens
  }
`)

interface WebFetchProps {
  webFetches: WebFetch_WebFetchesFragment[]
}

export const WebFetch = ({ webFetches }: WebFetchProps) => {
  const { t } = useTranslation()
  const [items, setItems] = useState(webFetches)
  const [newItems, setNewItems] = useState<string[]>([crypto.randomUUID()])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setItems(webFetches)
      setNewItems([crypto.randomUUID()])
    }, 100)
    return () => clearTimeout(timeout)
  }, [webFetches])

  const addNewItem = () => {
    setNewItems((prev) => [...prev, crypto.randomUUID()])
  }

  const removeNewItem = (index: number) => {
    setNewItems((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-base-content/60">{t('lists.contextSources.webFetchHelp')}</p>

      {/* Display existing web fetches with inline editing */}
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((fetch, index) => {
            const query = fetch.contextQuery ? JSON.parse(fetch.contextQuery) : {}
            return (
              <div key={fetch.id} className="rounded-sm bg-base-200 p-3">
                <input type="hidden" name={`webFetch_id_${index}`} value={fetch.id} />
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {t('lists.contextSources.webFetch')} #{index + 1}
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
                    <label className="mb-1 block text-xs font-medium">{t('lists.contextSources.urlTemplate')}</label>
                    <input
                      type="text"
                      name={`webFetch_urlTemplate_${index}`}
                      className="input input-sm w-full"
                      defaultValue={query.urlTemplate || ''}
                      placeholder={t('lists.contextSources.urlTemplatePlaceholder')}
                      aria-label={t('lists.contextSources.urlTemplate')}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium">{t('lists.contextSources.maxTokens')}</label>
                    <input
                      type="number"
                      name={`webFetch_maxTokens_${index}`}
                      className="input input-sm w-full"
                      defaultValue={fetch.maxContentTokens || 1000}
                      min="100"
                      max="10000"
                      step="100"
                      aria-label={t('lists.contextSources.webFetchMaxTokens')}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add new web fetches */}
      <div className="space-y-2">
        {newItems.map((itemId, newIndex) => (
          <div key={itemId} className="rounded-sm border border-base-300 bg-base-100 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-medium">
                {newIndex === 0
                  ? t('lists.contextSources.addWebFetch')
                  : `${t('lists.contextSources.webFetch')} (${t('actions.new')})`}
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
              {/* URL Template */}
              <div>
                <label className="mb-1 block text-xs font-medium">{t('lists.contextSources.urlTemplate')}</label>
                <input
                  type="text"
                  name={`webFetch_urlTemplate_new_${newIndex}`}
                  className="input input-sm w-full"
                  placeholder={t('lists.contextSources.urlTemplatePlaceholder')}
                  aria-label={t('lists.contextSources.urlTemplate')}
                />
                {newIndex === 0 && (
                  <p className="mt-1 text-xs text-base-content/60">{t('lists.contextSources.templateHelp')}</p>
                )}
              </div>

              {/* Max Tokens */}
              <div>
                <label className="mb-1 block text-xs font-medium">{t('lists.contextSources.maxTokens')}</label>
                <input
                  type="number"
                  name={`webFetch_maxTokens_new_${newIndex}`}
                  className="input input-sm w-full"
                  placeholder="1000"
                  aria-label={t('lists.contextSources.webFetchMaxTokens')}
                  min="100"
                  max="10000"
                  step="100"
                  defaultValue="1000"
                />
              </div>
            </div>
          </div>
        ))}
        <button type="button" className="btn w-full btn-ghost btn-sm" onClick={addNewItem}>
          + {t('lists.contextSources.addWebFetch')}
        </button>
      </div>

      {webFetches.length === 0 && (
        <p className="py-2 text-center text-sm text-base-content/50">{t('lists.contextSources.noWebFetches')}</p>
      )}
    </div>
  )
}

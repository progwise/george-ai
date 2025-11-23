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

  return (
    <div className="space-y-4">
      <p className="text-base-content/60 text-sm">{t('lists.contextSources.similarContentHelp')}</p>

      {/* Display existing vector searches */}
      {vectorSearches.length > 0 && (
        <div className="space-y-2">
          {vectorSearches.map((search, index) => {
            const query = search.contextQuery ? JSON.parse(search.contextQuery) : {}
            const deleteCheckboxId = `deleteVectorSearch_${search.id}`
            return (
              <div key={search.id} className="bg-base-200 rounded p-3">
                <input type="hidden" name={deleteCheckboxId} value="" />
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {t('lists.contextSources.vectorSearch')} #{index + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-base-content/50 text-xs">
                      {search.maxContentTokens} {t('lists.contextSources.tokens')}
                    </span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs text-error"
                      onClick={(e) => {
                        const checkbox = e.currentTarget.parentElement?.parentElement?.querySelector(
                          `input[name="${deleteCheckboxId}"]`,
                        ) as HTMLInputElement
                        if (checkbox) {
                          checkbox.value = 'delete'
                          e.currentTarget.closest('.bg-base-200')?.classList.add('opacity-50', 'line-through')
                          e.currentTarget.textContent = t('actions.undoDelete')
                          e.currentTarget.classList.remove('text-error')
                          e.currentTarget.classList.add('text-success')
                        }
                      }}
                    >
                      {t('actions.delete')}
                    </button>
                  </div>
                </div>
                <div className="text-sm">
                  <span className="text-base-content/60">{t('lists.contextSources.query')}:</span>{' '}
                  {query.queryTemplate || t('lists.contextSources.noQuerySet')}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add new vector search */}
      <div className="border-base-300 bg-base-100 rounded border p-4">
        <h4 className="mb-3 text-sm font-medium">{t('lists.contextSources.addVectorSearch')}</h4>

        <div className="space-y-3">
          {/* Query Template */}
          <div>
            <label className="mb-1 block text-xs font-medium">{t('lists.contextSources.queryTemplate')}</label>
            <input
              type="text"
              name="vectorSearch_queryTemplate_new"
              className="input input-sm w-full"
              placeholder={t('lists.contextSources.queryTemplatePlaceholder')}
            />
            <p className="text-base-content/60 mt-1 text-xs">{t('lists.contextSources.templateHelp')}</p>
          </div>

          {/* Max Tokens */}
          <div>
            <label className="mb-1 block text-xs font-medium">{t('lists.contextSources.maxTokens')}</label>
            <input
              type="number"
              name="vectorSearch_maxTokens_new"
              className="input input-sm w-full"
              placeholder="1000"
              min="100"
              max="10000"
              step="100"
              defaultValue="1000"
            />
          </div>
        </div>
      </div>

      {vectorSearches.length === 0 && (
        <p className="text-base-content/50 py-2 text-center text-sm">{t('lists.contextSources.noVectorSearches')}</p>
      )}
    </div>
  )
}

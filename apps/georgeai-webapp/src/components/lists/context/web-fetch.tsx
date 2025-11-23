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

  return (
    <div className="space-y-4">
      <p className="text-base-content/60 text-sm">{t('lists.contextSources.webFetchHelp')}</p>

      {/* Display existing web fetches */}
      {webFetches.length > 0 && (
        <div className="space-y-2">
          {webFetches.map((fetch, index) => {
            const query = fetch.contextQuery ? JSON.parse(fetch.contextQuery) : {}
            return (
              <div key={fetch.id} className="bg-base-200 rounded p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {t('lists.contextSources.webFetch')} #{index + 1}
                  </span>
                  <span className="text-base-content/50 text-xs">
                    {fetch.maxContentTokens} {t('lists.contextSources.tokens')}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-base-content/60">{t('lists.contextSources.urlTemplate')}:</span>{' '}
                  {query.urlTemplate || t('lists.contextSources.noUrlSet')}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {webFetches.length === 0 && (
        <p className="text-base-content/50 py-2 text-center text-sm">{t('lists.contextSources.noWebFetches')}</p>
      )}

      {/* TODO: Add form to create new web fetches */}
      <p className="text-base-content/50 text-xs italic">{t('lists.contextSources.webFetchComingSoon')}</p>
    </div>
  )
}

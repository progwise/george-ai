import { useEffect, useState } from 'react'

import { graphql } from '../../../gql'
import { FullContent_FullContentsFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'

graphql(`
  fragment FullContent_FullContents on AiListFieldContext {
    id
    maxContentTokens
  }
`)

interface FullContentProps {
  fullContents: FullContent_FullContentsFragment[]
}

export const FullContent = ({ fullContents }: FullContentProps) => {
  const { t } = useTranslation()
  const [enabled, setEnabled] = useState(fullContents.length > 0)
  const [maxTokens, setMaxTokens] = useState(fullContents[0]?.maxContentTokens || 32000)
  const existingId = fullContents[0]?.id || null

  useEffect(() => {
    const timeout = setTimeout(() => {
      setEnabled(fullContents.length > 0)
      setMaxTokens(fullContents[0]?.maxContentTokens || 32000)
    }, 100)
    return () => clearTimeout(timeout)
  }, [fullContents])

  return (
    <div className="space-y-4">
      <p className="text-sm text-base-content/60">{t('lists.contextSources.fullContentHelp')}</p>

      {/* Hidden field to track existing ID for updates */}
      {existingId && <input type="hidden" name="fullContent_id" value={existingId} />}

      {/* Enable/Disable Toggle */}
      <div>
        <label className="label cursor-pointer justify-start gap-3">
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            name="fullContent_enabled"
          />
          <div>
            <span className="font-medium">{t('lists.contextSources.includeFullContent')}</span>
            <p className="text-xs text-base-content/60">{t('lists.contextSources.fullContentDescription')}</p>
          </div>
        </label>
      </div>

      {/* Max Tokens Configuration (only shown when enabled) */}
      {enabled && (
        <div className="rounded-sm border border-base-300 bg-base-100 p-4">
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium">{t('lists.contextSources.maxTokens')}</label>
              <input
                type="number"
                name="fullContent_maxTokens"
                className="input input-sm w-full"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
                min="1000"
                max="200000"
                step="1000"
                aria-label={t('lists.contextSources.fullContentMaxTokens')}
              />
              <p className="mt-1 text-xs text-base-content/60">{t('lists.contextSources.fullContentTokensHelp')}</p>
            </div>
          </div>
        </div>
      )}

      {!enabled && (
        <p className="py-2 text-center text-sm text-base-content/50">{t('lists.contextSources.fullContentDisabled')}</p>
      )}
    </div>
  )
}

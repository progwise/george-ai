import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { ListSourcesManager_ListFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { WarnIcon } from '../../icons/warn-icon'
import { toastError, toastSuccess } from '../georgeToaster'
import { getEnrichmentsStatisticsQueryOptions } from './queries'
import { updateExtractionStrategy } from './server-functions'

type Source = ListSourcesManager_ListFragment['sources'][number]

interface ExtractionStrategyModalProps {
  listId: string
  source: Source
  onClose: () => void
  onSuccess: () => void
}

const EXTRACTION_STRATEGIES = ['per_file', 'per_row', 'per_column', 'llm_prompt'] as const
type ExtractionStrategy = (typeof EXTRACTION_STRATEGIES)[number]

export const ExtractionStrategyModal = ({ listId, source, onClose, onSuccess }: ExtractionStrategyModalProps) => {
  const { t } = useTranslation()
  const [strategy, setStrategy] = useState<ExtractionStrategy>(
    (source.extractionStrategy as ExtractionStrategy) || 'per_file',
  )
  const [llmPrompt, setLlmPrompt] = useState<string>(
    source.extractionConfig ? (source.extractionConfig as { prompt?: string })?.prompt || '' : '',
  )
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Fetch enrichment statistics to check if there are existing enrichments
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    ...getEnrichmentsStatisticsQueryOptions(listId),
    staleTime: 0, // Always refetch when modal opens
  })

  const enrichmentStats = statsData?.aiListEnrichmentsStatistics || []
  const fieldsWithEnrichments = enrichmentStats.filter((stat) => stat.valuesCount > 0)
  const hasEnrichments = fieldsWithEnrichments.length > 0
  const totalEnrichments = fieldsWithEnrichments.reduce((sum, stat) => sum + stat.valuesCount, 0)

  const { mutate: updateStrategy, isPending } = useMutation({
    mutationFn: updateExtractionStrategy,
    onError: (error) => toastError(t('lists.sources.updateError', { message: error.message })),
    onSuccess: () => {
      toastSuccess(t('lists.sources.updateSuccess'))
      onSuccess()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // If there are enrichments and we haven't confirmed yet, show warning
    if (hasEnrichments && !showConfirmation) {
      setShowConfirmation(true)
      return
    }

    const extractionConfig = strategy === 'llm_prompt' ? JSON.stringify({ prompt: llmPrompt }) : undefined

    updateStrategy({
      data: {
        sourceId: source.id,
        extractionStrategy: strategy,
        extractionConfig,
      },
    })
  }

  const handleConfirmDelete = () => {
    const extractionConfig = strategy === 'llm_prompt' ? JSON.stringify({ prompt: llmPrompt }) : undefined

    updateStrategy({
      data: {
        sourceId: source.id,
        extractionStrategy: strategy,
        extractionConfig,
      },
    })
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-lg bg-base-100 shadow-xl">
          {showConfirmation ? (
            // Confirmation Step
            <div>
              {/* Header */}
              <div className="border-b border-base-300 p-4">
                <div className="flex items-center gap-2 text-warning">
                  <WarnIcon className="size-6" />
                  <h3 className="text-lg font-semibold">{t('lists.sources.warningTitle')}</h3>
                </div>
              </div>

              {/* Body */}
              <div className="space-y-4 p-4">
                <p className="text-base-content/80">{t('lists.sources.warningDescription')}</p>

                <div>
                  <p className="mb-2 font-medium">{t('lists.sources.warningFieldsAffected')}</p>
                  <div className="max-h-48 overflow-y-auto rounded-lg bg-base-200 p-3">
                    {fieldsWithEnrichments.map((stat) => (
                      <div key={stat.fieldId} className="flex items-center justify-between py-1">
                        <span className="font-medium">{stat.fieldName}</span>
                        <span className="text-sm text-base-content/60">
                          {t('lists.sources.enrichmentsCount', { count: stat.valuesCount })}
                        </span>
                      </div>
                    ))}
                    <div className="mt-2 border-t border-base-300 pt-2">
                      <div className="flex items-center justify-between font-semibold">
                        <span>Total</span>
                        <span>{t('lists.sources.enrichmentsCount', { count: totalEnrichments })}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-info/10 p-3 text-sm text-info">
                  {t('lists.sources.warningSuggestion')}
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 border-t border-base-300 p-4">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowConfirmation(false)}
                  disabled={isPending}
                >
                  {t('lists.sources.warningCancel')}
                </button>
                <button type="button" className="btn btn-warning" onClick={handleConfirmDelete} disabled={isPending}>
                  {isPending ? t('actions.saving') : t('lists.sources.warningConfirm')}
                </button>
              </div>
            </div>
          ) : (
            // Strategy Selection Step
            <form onSubmit={handleSubmit}>
              {/* Header */}
              <div className="border-b border-base-300 p-4">
                <h3 className="text-lg font-semibold">{t('lists.sources.configureExtraction')}</h3>
                <p className="text-sm text-base-content/70">{source.library?.name}</p>
              </div>

              {/* Body */}
              <div className="space-y-4 p-4">
                {/* Strategy Selection */}
                <div>
                  <label className="label">
                    <span className="font-medium">{t('lists.sources.extractionStrategy')}</span>
                  </label>
                  <p className="mb-3 text-sm text-base-content/70">
                    {t('lists.sources.extractionStrategyDescription')}
                  </p>

                  <div className="space-y-2">
                    {EXTRACTION_STRATEGIES.map((s) => (
                      <label
                        key={s}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border border-base-300 p-3 hover:bg-base-200 ${
                          strategy === s ? 'border-primary bg-primary/5' : ''
                        }`}
                      >
                        <input
                          type="radio"
                          name="strategy"
                          className="radio radio-primary"
                          value={s}
                          checked={strategy === s}
                          onChange={() => setStrategy(s)}
                          disabled={isPending || isLoadingStats}
                        />
                        <div>
                          <div className="font-medium">{t(`lists.sources.strategies.${s}`)}</div>
                          <div className="text-sm text-base-content/60">
                            {t(`lists.sources.strategies.${s}_description`)}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* LLM Prompt Configuration (only shown for llm_prompt strategy) */}
                {strategy === 'llm_prompt' && (
                  <div>
                    <label className="label">
                      <span className="font-medium">{t('lists.sources.extractionConfig')}</span>
                    </label>
                    <textarea
                      className="textarea w-full"
                      rows={4}
                      value={llmPrompt}
                      onChange={(e) => setLlmPrompt(e.target.value)}
                      placeholder={t('lists.sources.llmPromptPlaceholder')}
                      disabled={isPending}
                    />
                    <p className="mt-1 text-xs text-base-content/60">{t('lists.sources.llmPromptHelp')}</p>
                  </div>
                )}

                {/* Warning preview if there are enrichments */}
                {hasEnrichments && (
                  <div className="flex items-start gap-2 rounded-lg bg-warning/10 p-3 text-sm text-warning-content">
                    <WarnIcon className="mt-0.5 size-4 shrink-0" />
                    <span>{t('lists.sources.enrichmentsWillBeDeleted', { count: totalEnrichments })}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 border-t border-base-300 p-4">
                <button type="button" className="btn btn-ghost" onClick={onClose} disabled={isPending}>
                  {t('actions.cancel')}
                </button>
                <button type="submit" className="btn btn-primary" disabled={isPending || isLoadingStats}>
                  {isPending ? t('actions.saving') : isLoadingStats ? t('loading') : t('actions.save')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  )
}

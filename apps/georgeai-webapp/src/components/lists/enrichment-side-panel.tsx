import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { duration } from '@george-ai/web-utils'

import { graphql } from '../../gql'
import {
  EnrichmentSidePanel_FieldValueFragment,
  EnrichmentSidePanel_OriginFragment,
  EnrichmentStatus,
} from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { CopyIcon } from '../../icons/copy-icon'
import { CrossIcon } from '../../icons/cross-icon'
import { ReprocessIcon } from '../../icons/reprocess-icon'
import { TrashIcon } from '../../icons/trash-icon'
import { ClientDate } from '../client-date'
import { FormattedMarkdown } from '../formatted-markdown'
import { getEnrichmentsQueryOptions } from './queries'
import { useEnrichmentActions } from './use-enrichment-actions'

// Re-export fragments so they can be used where this component is imported
graphql(`
  fragment EnrichmentSidePanel_FieldValue on FieldValueResult {
    fieldId
    fieldName
    fieldType
    displayValue
    enrichmentErrorMessage
    failedEnrichmentValue
    queueStatus
  }
`)

graphql(`
  fragment EnrichmentSidePanel_Origin on ListItemResult {
    id
    name
    libraryId
    libraryName
  }
`)

interface EnrichmentSidePanelProps {
  isOpen: boolean
  onClose: () => void
  listId: string
  itemId: string
  fieldValue: EnrichmentSidePanel_FieldValueFragment
  origin: EnrichmentSidePanel_OriginFragment
}

export const EnrichmentSidePanel = ({
  isOpen,
  onClose,
  listId,
  itemId,
  fieldValue,
  origin,
}: EnrichmentSidePanelProps) => {
  const {
    fieldId,
    fieldName,
    fieldType,
    displayValue: value,
    enrichmentErrorMessage: error,
    failedEnrichmentValue,
  } = fieldValue
  const { name: fileName } = origin
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const { startEnrichment, clearEnrichments, isPending: actionsPending } = useEnrichmentActions(listId)

  // Fetch enrichment details when panel opens
  const { data, isLoading } = useQuery({
    ...getEnrichmentsQueryOptions({
      listId,
      itemId,
      fieldId,
      take: 1,
      skip: 0,
    }),
    enabled: isOpen,
  })

  const enrichment = data?.aiListEnrichments?.enrichments?.[0]
  const processingData = enrichment?.processingData

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleCopy = async () => {
    if (value) {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleRetry = () => {
    startEnrichment({ fieldId, itemId })
  }

  const handleClear = () => {
    clearEnrichments({ fieldId, itemId }, { onSuccess: () => onClose() })
  }

  // Determine display value
  const displayValue = value || processingData?.output?.enrichedValue || null
  const isMarkdown = fieldType === 'markdown'

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} aria-label="Close side panel" />}

      {/* Side Panel */}
      <div
        className={twMerge(
          'fixed top-0 right-0 z-50 flex h-full w-[480px] max-w-full flex-col border-l bg-base-100 shadow-xl transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        role="dialog"
        aria-modal="true"
        aria-label={`Enrichment details for ${fieldName}`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-base-300 p-4">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold" title={fieldName}>
              {fieldName}
            </h3>
            <p className="truncate text-sm text-base-content/60" title={fileName}>
              {fileName}
            </p>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-sm" aria-label="Close panel">
            <CrossIcon className="size-5" />
          </button>
        </div>

        {/* Content - scrollable */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <span className="loading loading-md loading-spinner" />
              <span className="ml-2">{t('lists.enrichment.sidePanel.loading')}</span>
            </div>
          ) : (
            <>
              {/* Value Section */}
              <section aria-label={t('lists.enrichment.sidePanel.value')}>
                <h4 className="mb-2 font-semibold">{t('lists.enrichment.sidePanel.value')}</h4>
                <div className="rounded-lg bg-base-200 p-3">
                  {error ? (
                    <div className="text-error">
                      <span className="font-semibold">❌ {t('lists.enrichment.error')}</span>
                      <p className="mt-1 text-sm">{error}</p>
                    </div>
                  ) : failedEnrichmentValue ? (
                    <div className="text-warning">
                      <span className="font-semibold">⚠️ {t('lists.enrichment.failedTerm')}</span>
                      <p className="mt-1 text-sm">{failedEnrichmentValue}</p>
                    </div>
                  ) : displayValue ? (
                    isMarkdown ? (
                      <div className="prose prose-sm max-w-none">
                        <FormattedMarkdown markdown={displayValue} />
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap text-base-content">{displayValue}</p>
                    )
                  ) : (
                    <p className="text-base-content/50 italic">{t('lists.enrichment.notEnriched')}</p>
                  )}
                </div>
              </section>

              {/* Metadata Section */}
              {enrichment && (
                <section aria-label={t('lists.enrichment.sidePanel.metadata')}>
                  <h4 className="mb-2 font-semibold">{t('lists.enrichment.sidePanel.metadata')}</h4>
                  <div className="space-y-2 rounded-lg bg-base-200 p-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-base-content/60">{t('lists.enrichment.sidePanel.status')}</span>
                      <span
                        className={twMerge(
                          'font-medium',
                          enrichment.status === EnrichmentStatus.Completed && 'text-success',
                          enrichment.status === EnrichmentStatus.Error && 'text-error',
                          enrichment.status === EnrichmentStatus.Failed && 'text-warning',
                          enrichment.status === EnrichmentStatus.Processing && 'text-primary',
                          enrichment.status === EnrichmentStatus.Pending && 'text-info',
                        )}
                      >
                        {enrichment.status}
                      </span>
                    </div>
                    {processingData?.input?.aiModelName && (
                      <div className="flex justify-between">
                        <span className="text-base-content/60">{t('lists.enrichment.sidePanel.aiModel')}</span>
                        <span className="font-mono text-xs">{processingData.input.aiModelName}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-base-content/60">{t('lists.enrichment.sidePanel.duration')}</span>
                      <span>{duration(enrichment.requestedAt, enrichment.completedAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-base-content/60">{t('lists.enrichment.sidePanel.requestedAt')}</span>
                      <ClientDate date={enrichment.requestedAt} format="dateTime" />
                    </div>
                    {enrichment.completedAt && (
                      <div className="flex justify-between">
                        <span className="text-base-content/60">{t('lists.enrichment.sidePanel.completedAt')}</span>
                        <ClientDate date={enrichment.completedAt} format="dateTime" />
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Issues Section */}
              {processingData?.output?.issues && processingData.output.issues.length > 0 && (
                <section aria-label={t('lists.enrichment.sidePanel.issues')}>
                  <h4 className="mb-2 font-semibold">{t('lists.enrichment.sidePanel.issues')}</h4>
                  <div className="rounded-lg bg-warning/10 p-3">
                    <ul className="list-inside list-disc text-sm">
                      {processingData.output.issues.map((issue: string) => (
                        <li key={issue}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                </section>
              )}

              {/* Context Section */}
              <section aria-label={t('lists.enrichment.sidePanel.context')}>
                <h4 className="mb-2 font-semibold">{t('lists.enrichment.sidePanel.context')}</h4>

                {/* Field References */}
                {processingData?.input?.contextFields && processingData.input.contextFields.length > 0 && (
                  <div className="mb-2 rounded-lg bg-base-200 p-3">
                    <h5 className="mb-2 text-xs font-semibold text-base-content/70 uppercase">
                      {t('lists.enrichment.sidePanel.fieldReferences')}
                    </h5>
                    <div className="space-y-2 text-sm">
                      {processingData.input.contextFields.map(
                        (ctx: { fieldId: string; fieldName: string; value: string | null }) => (
                          <div key={ctx.fieldId} className="border-l-2 border-base-300 pl-2">
                            <span className="text-xs text-base-content/60">{ctx.fieldName}:</span>
                            <pre className="mt-1 max-h-40 overflow-auto text-xs text-base-content/70">
                              {ctx.value || '-'}
                            </pre>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {/* Vector Search Results */}
                {processingData?.output?.similarChunks && processingData.output.similarChunks.length > 0 && (
                  <div className="mb-2 rounded-lg bg-base-200 p-3">
                    <h5 className="mb-2 text-xs font-semibold text-base-content/70 uppercase">
                      {t('lists.enrichment.sidePanel.similarChunks')}
                    </h5>
                    <div className="space-y-2 text-sm">
                      {processingData.output.similarChunks.map(
                        (chunk: { id: string; fileName: string; fileId: string; text: string; distance: number }) => (
                          <div key={chunk.id} className="border-l-2 border-base-300 pl-2">
                            <div className="flex items-center justify-between">
                              <Link
                                to="/libraries/$libraryId/files/$fileId"
                                params={{
                                  libraryId: processingData.input?.libraryId || '',
                                  fileId: chunk.fileId,
                                }}
                                className="link text-xs link-primary"
                              >
                                {chunk.fileName}
                              </Link>
                              <span className="text-xs text-base-content/50">
                                {t('lists.enrichment.sidePanel.distance')}: {chunk.distance.toFixed(3)}
                              </span>
                            </div>
                            <pre className="mt-1 max-h-40 overflow-auto text-xs text-base-content/70">{chunk.text}</pre>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {/* Web Fetch Results */}
                {processingData?.output?.webFetchResults && processingData.output.webFetchResults.length > 0 && (
                  <div className="mb-2 rounded-lg bg-base-200 p-3">
                    <h5 className="mb-2 text-xs font-semibold text-base-content/70 uppercase">Web Fetch</h5>
                    <div className="space-y-2 text-sm">
                      {processingData.output.webFetchResults.map((result: { url: string; content: string }) => (
                        <div key={result.url} className="border-l-2 border-base-300 pl-2">
                          <a
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link text-xs link-primary"
                          >
                            {result.url}
                          </a>
                          <pre className="mt-1 max-h-40 overflow-auto text-xs text-base-content/70">
                            {result.content}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Full Content */}
                {processingData?.output?.fullContent && (
                  <div className="mb-2 rounded-lg bg-base-200 p-3">
                    <h5 className="mb-2 text-xs font-semibold text-base-content/70 uppercase">Full Content</h5>
                    <div className="border-l-2 border-base-300 pl-2 text-sm">
                      <span className="text-xs text-base-content/60">{processingData.output.fullContent.fileName}</span>
                      <pre className="mt-1 max-h-60 overflow-auto text-xs text-base-content/70">
                        {processingData.output.fullContent.content}
                      </pre>
                    </div>
                  </div>
                )}

                {/* No Context */}
                {(!processingData?.input?.contextFields || processingData.input.contextFields.length === 0) &&
                  (!processingData?.output?.similarChunks || processingData.output.similarChunks.length === 0) &&
                  (!processingData?.output?.webFetchResults || processingData.output.webFetchResults.length === 0) &&
                  !processingData?.output?.fullContent && (
                    <div className="rounded-lg bg-base-200 p-3">
                      <p className="text-sm text-base-content/50 italic">{t('lists.enrichment.sidePanel.noContext')}</p>
                    </div>
                  )}
              </section>

              {/* Prompt Section */}
              {processingData?.input?.aiGenerationPrompt && (
                <section aria-label={t('lists.enrichment.sidePanel.promptSentToLlm')}>
                  <h4 className="mb-2 font-semibold">{t('lists.enrichment.sidePanel.promptSentToLlm')}</h4>
                  <div className="rounded-lg bg-base-200 p-3">
                    <pre className="max-h-40 overflow-auto text-xs whitespace-pre-wrap text-base-content/80">
                      {processingData.input.aiGenerationPrompt}
                    </pre>
                  </div>
                </section>
              )}
            </>
          )}
        </div>

        {/* Actions - fixed at bottom */}
        <div className="flex shrink-0 gap-2 border-t border-base-300 p-4">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleCopy}
            disabled={!displayValue}
            aria-label={t('lists.enrichment.sidePanel.copy')}
          >
            <CopyIcon className="size-4" />
            {copied ? t('lists.enrichment.sidePanel.copied') : t('lists.enrichment.sidePanel.copy')}
          </button>
          <div className="flex-1" />
          <button
            type="button"
            className="btn text-error btn-ghost btn-sm"
            onClick={handleClear}
            disabled={actionsPending || (!value && !error && !failedEnrichmentValue)}
            aria-label={t('lists.enrichment.sidePanel.clear')}
          >
            <TrashIcon className="size-4" />
            {t('lists.enrichment.sidePanel.clear')}
          </button>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={handleRetry}
            disabled={actionsPending}
            aria-label={t('lists.enrichment.sidePanel.retry')}
          >
            <ReprocessIcon className="size-4" />
            {t('lists.enrichment.sidePanel.retry')}
          </button>
        </div>
      </div>
    </>
  )
}

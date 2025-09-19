import { Link } from '@tanstack/react-router'
import { useRef } from 'react'
import { twMerge } from 'tailwind-merge'

import { dateTimeString, duration } from '@george-ai/web-utils'

import { graphql } from '../../gql'
import { EnrichmentAccordionItem_EnrichmentFragment, EnrichmentStatus } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import ErrorIcon from '../../icons/error-icon'
import { ReprocessIcon } from '../../icons/reprocess-icon'
import { JsonModal } from '../json-modal'
import { useEnrichmentActions } from './use-enrichment-actions'

graphql(`
  fragment EnrichmentAccordionItem_Enrichment on AiEnrichmentTask {
    id
    listId
    fileId
    fieldId
    status
    priority
    requestedAt
    startedAt
    completedAt
    metadata
    processingData {
      input {
        fileId
        fileName
        libraryId
        libraryName
        aiModel
        aiGenerationPrompt
        contextFields {
          fieldId
          fieldName
          value
          errorMessage
        }
        dataType
        libraryEmbeddingModel
        contentQuery
        useVectorStore
      }
      output {
        similarChunks {
          id
          fileName
          fileId
          text
          distance
        }
        messages {
          role
          content
        }
        aiInstance
        enrichedValue
        issues
      }
    }
    error
    field {
      id
      name
    }
    file {
      id
      name
      library {
        id
        name
      }
    }
    list {
      id
      name
    }
  }
`)

interface EnrichmentAccordionItemProps {
  enrichment: EnrichmentAccordionItem_EnrichmentFragment
  index: number
}

export const EnrichmentAccordionItem = ({ enrichment, index }: EnrichmentAccordionItemProps) => {
  const { language } = useTranslation()
  const metadataModalRef = useRef<HTMLDialogElement>(null)
  const { startEnrichment, clearEnrichments, isPending: actionsPending } = useEnrichmentActions(enrichment.listId)

  return (
    <div className="collapse-arrow join-item border-base-300 collapse border">
      <input type="radio" name={`task-accordion`} defaultChecked={index === 0} className="peer" />
      <div className="collapse-title peer-checked:bg-base-100 font-semibold opacity-40 peer-checked:opacity-100">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-base-content/60">File:</span>
              <span className="text-base-content font-mono">{enrichment.file.name}</span>
              <span className="text-base-content/40">→</span>
              <span className="text-primary">{enrichment.field.name}</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-base-content/50">{dateTimeString(enrichment.requestedAt, language)}</span>
              {enrichment.status === EnrichmentStatus.Completed && enrichment.processingData.output?.enrichedValue && (
                <>
                  <span className="text-base-content/40">•</span>
                  <span className="text-success max-w-md truncate">
                    Value: {enrichment.processingData.output.enrichedValue}
                  </span>
                </>
              )}
              {enrichment.status === EnrichmentStatus.Failed && enrichment.error && (
                <>
                  <span className="text-base-content/40">•</span>
                  <span className="text-error flex items-center gap-1">
                    <ErrorIcon className="size-3" />
                    <span className="max-w-md truncate">{enrichment.error}</span>
                  </span>
                </>
              )}
              {enrichment.status === EnrichmentStatus.Processing && (
                <>
                  <span className="text-base-content/40">•</span>
                  <span className="text-info">Processing...</span>
                </>
              )}
              {enrichment.status === EnrichmentStatus.Pending && (
                <>
                  <span className="text-base-content/40">•</span>
                  <span className="text-warning">Waiting in queue...</span>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <span
              className={twMerge(
                'badge badge-sm badge-outline',
                enrichment.status === EnrichmentStatus.Pending ? 'badge-warning' : '',
                enrichment.status === EnrichmentStatus.Processing ? 'badge-info' : '',
                enrichment.status === EnrichmentStatus.Completed ? 'badge-success' : '',
                enrichment.status === EnrichmentStatus.Failed ? 'badge-error' : '',
                enrichment.status === EnrichmentStatus.Canceled ? 'badge-secondary' : '',
              )}
            >
              <svg className="size-3" fill="currentColor" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="8" />
              </svg>
              <span className="text-base-content/80">{enrichment.status}</span>
            </span>
          </div>
        </div>
      </div>
      <div className="collapse-content bg-base-100 text-sm">
        <div className="space-y-4 pt-4">
          {/* Error Display */}
          {enrichment.status === EnrichmentStatus.Failed && enrichment.error && (
            <div className="alert alert-error">
              <ErrorIcon className="size-5" />
              <div>
                <h3 className="font-semibold">Enrichment Failed</h3>
                <p className="text-sm">{enrichment.error}</p>
              </div>
            </div>
          )}

          {/* Success Result Display */}
          {enrichment.status === EnrichmentStatus.Completed && enrichment.processingData.output?.enrichedValue && (
            <div className="bg-base-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <span className="text-base-content/60 min-w-fit font-semibold">Enriched Value:</span>
                <span className="text-base-content">{enrichment.processingData.output.enrichedValue}</span>
              </div>
            </div>
          )}

          {/* Core Information Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex gap-2">
                <span className="text-base-content/60 min-w-[80px]">List:</span>
                <span className="font-medium">{enrichment.list.name}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-base-content/60 min-w-[80px]">Library:</span>
                <span className="font-medium">{enrichment.file.library.name}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-base-content/60 min-w-[80px]">File:</span>
                <Link
                  to="/libraries/$libraryId/files/$fileId"
                  params={{ libraryId: enrichment.file.library.id, fileId: enrichment.file.id }}
                  className="link link-primary"
                >
                  {enrichment.file.name}
                </Link>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <span className="text-base-content/60 min-w-[80px]">Status:</span>
                <span
                  className={twMerge(
                    'font-medium',
                    enrichment.status === EnrichmentStatus.Completed && 'text-success',
                    enrichment.status === EnrichmentStatus.Failed && 'text-error',
                    enrichment.status === EnrichmentStatus.Processing && 'text-info',
                    enrichment.status === EnrichmentStatus.Pending && 'text-warning',
                  )}
                >
                  {enrichment.status}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-base-content/60 min-w-[80px]">Duration:</span>
                <span>{duration(enrichment.requestedAt, enrichment.completedAt)}</span>
              </div>
              {enrichment.processingData.input?.aiModel && (
                <div className="flex gap-2">
                  <span className="text-base-content/60 min-w-[80px]">AI Model:</span>
                  <span className="font-mono text-xs">{enrichment.processingData.input.aiModel}</span>
                </div>
              )}
            </div>
          </div>

          {/* Processing Details */}
          {enrichment.processingData.output?.issues && enrichment.processingData.output.issues.length > 0 && (
            <div className="bg-warning/10 rounded-lg p-3">
              <h4 className="text-warning mb-1 font-semibold">Issues:</h4>
              <ul className="list-inside list-disc text-sm">
                {enrichment.processingData.output.issues.map((issue: string) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="border-base-300 flex items-center justify-between border-t pt-2">
            <div className="flex gap-2">
              {enrichment.processingData && (
                <button
                  type="button"
                  className="btn btn-sm btn-ghost tooltip"
                  data-tip="View Process Data"
                  onClick={() => metadataModalRef.current?.showModal()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                  <span>Details</span>
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn btn-sm btn-ghost text-error tooltip"
                data-tip="Clear Enrichment"
                disabled={actionsPending}
                onClick={() => clearEnrichments({ fieldId: enrichment.fieldId, fileId: enrichment.fileId })}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-7.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 1 7.5 0"
                  />
                </svg>
                <span>Clear</span>
              </button>
              {/* Retry button for completed or failed tasks */}
              {(enrichment.completedAt || enrichment.status === EnrichmentStatus.Failed) && (
                <button
                  type="button"
                  className="btn btn-sm btn-primary tooltip"
                  data-tip="Retry Enrichment"
                  disabled={actionsPending}
                  onClick={() => startEnrichment({ fieldId: enrichment.fieldId, fileId: enrichment.fileId })}
                >
                  <ReprocessIcon className="size-4" />
                  <span>Retry</span>
                </button>
              )}
            </div>
          </div>

          {/* Process Timeline - 3-Phase Pipeline */}

          {/* Additional Data & Actions - Single row */}
        </div>
      </div>
      {/* Modals */}
      {enrichment.metadata && <JsonModal ref={metadataModalRef} title="Processing Data" data={enrichment.metadata} />}
    </div>
  )
}

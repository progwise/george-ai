import { useRef } from 'react'
import { twMerge } from 'tailwind-merge'

import { dateTimeString, formatDuration } from '@george-ai/web-utils'

import { graphql } from '../../../gql'
import {
  AiContentExtractionTask_AccordionItemFragment,
  EmbeddingStatus,
  ExtractionStatus,
  ProcessingStatus,
} from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { JsonModal } from './json-modal'
import { TaskTimeline } from './task-timeline'

graphql(`
  fragment AiContentExtractionTask_AccordionItem on AiFileContentExtractionTask {
    id
    ...AiContentExtractionTask_Timeline
    file {
      id
      name
    }
    createdAt
    extractionMethod
    timeoutMs
    markdownFileName
    metadata
    extractionOptions
    extractionStatus
    embeddingStatus
    processingTimeMs
    processingStatus
    chunksCount
    chunksSize
    ...AiContentExtractionTask_Timeline
  }
`)

interface TaskAccordionItemProps {
  task: AiContentExtractionTask_AccordionItemFragment
  index: number
  skip: number
  take: number
  hideFileName?: boolean
}

export const TaskAccordionItem = ({ task, index, skip, take, hideFileName }: TaskAccordionItemProps) => {
  const { language } = useTranslation()
  const extractionOptionsModalRef = useRef<HTMLDialogElement>(null)
  const metadataModalRef = useRef<HTMLDialogElement>(null)

  const openExtractionOptionsModal = () => {
    console.log('Opening Extraction Options Modal', extractionOptionsModalRef.current)
    extractionOptionsModalRef.current?.showModal()
  }

  const openMetadataModal = () => {
    console.log('Opening Metadata Modal', metadataModalRef.current)
    metadataModalRef.current?.showModal()
  }

  const getStatusBadgeClass = (status: ExtractionStatus | EmbeddingStatus) => {
    switch (status) {
      case ExtractionStatus.Completed:
      case EmbeddingStatus.Completed:
        return 'badge-success text-success'
      case ExtractionStatus.Failed:
      case EmbeddingStatus.Failed:
        return 'badge-error text-error'
      case ExtractionStatus.Running:
      case EmbeddingStatus.Running:
        return 'badge-info text-info'
      case ExtractionStatus.Pending:
      case EmbeddingStatus.Pending:
        return 'badge-warning text-warning'
      case ExtractionStatus.Skipped:
      case EmbeddingStatus.Skipped:
        return 'badge-ghost text-ghost opacity-50'
      default:
        return 'badge-neutral text-neutral'
    }
  }

  const getProcessingStatusBadgeClass = (status: ProcessingStatus) => {
    switch (status) {
      case ProcessingStatus.Completed:
        return 'badge-success text-success'
      case ProcessingStatus.Failed:
      case ProcessingStatus.ExtractionFailed:
      case ProcessingStatus.EmbeddingFailed:
        return 'badge-error text-error'
      case ProcessingStatus.Extracting:
      case ProcessingStatus.Embedding:
        return 'badge-info textinfo'
      case ProcessingStatus.Pending:
      case ProcessingStatus.ExtractionFinished:
      case ProcessingStatus.EmbeddingFinished:
        return 'badge-warning text-warning'
      case ProcessingStatus.None:
        return 'badge-neutral text-neutral'
      default:
        return 'badge-neutral text-neutral'
    }
  }

  return (
    <>
      <div className="collapse-arrow join-item border-base-300 collapse border">
        <input type="radio" name={`task-accordion-${skip}-${take}`} defaultChecked={index === 0} className="peer" />
        <div className="collapse-title peer-checked:bg-base-100 font-semibold opacity-40 peer-checked:opacity-100">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-nowrap">{task.extractionMethod || 'Unknown Method'}</span>
              {!hideFileName && <span className="text-nowrap">{`${task.file.name}`}</span>}
              <span className="text-neutral/50 text-nowrap text-xs">{dateTimeString(task.createdAt, language)}</span>
            </div>
            <div className="flex gap-2">
              <span className={twMerge('badge badge-sm badge-outline', getStatusBadgeClass(task.extractionStatus))}>
                <svg className="size-3" fill="currentColor" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="8" />
                </svg>
                <span className="text-base-content/80">Extraction: {task.extractionStatus}</span>
              </span>
              <span className={twMerge('badge badge-sm badge-outline', getStatusBadgeClass(task.embeddingStatus))}>
                <svg className="size-3" fill="currentColor" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="8" />
                </svg>
                <span className="text-base-content/80">Embedding: {task.embeddingStatus}</span>
              </span>
              <span
                className={twMerge(
                  'badge badge-sm badge-outline',
                  getProcessingStatusBadgeClass(task.processingStatus),
                )}
              >
                <svg className="size-3" fill="currentColor" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="8" />
                </svg>
                <span className="text-base-content/80">Processing: {task.processingStatus}</span>
              </span>
            </div>
          </div>
        </div>
        <div className="collapse-content bg-base-100 text-sm">
          <div className="space-y-4 pt-2">
            {/* Core Information - Compact 4-column grid */}
            <div className="grid grid-cols-1 gap-1 text-xs md:grid-cols-2 lg:grid-cols-4">
              <div>
                <span className="text-base-content/60">Method:</span> {task.extractionMethod || '-'}
              </div>
              <div>
                <span className="text-base-content/60">Total Duration:</span> {formatDuration(task.processingTimeMs)}
              </div>
              <div>
                <span className="text-base-content/60">Chunks:</span> {task.chunksCount || '-'}
              </div>
              <div>
                <span className="text-base-content/60">Size:</span>{' '}
                {task.chunksSize ? `${(task.chunksSize / 1024).toFixed(1)} KB` : '-'}
              </div>
            </div>

            {/* Process Timeline - 3-Phase Pipeline */}
            <TaskTimeline task={task} />

            {/* Additional Data & Actions - Single row */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {task.markdownFileName && (
                <div className="badge badge-ghost">
                  <span className="text-base-content/60">MD:</span> {task.markdownFileName}
                </div>
              )}
              {task.timeoutMs !== undefined && task.timeoutMs !== null && (
                <div className="badge badge-ghost">
                  <span className="text-base-content/60">Timeout:</span> {task.timeoutMs}ms
                </div>
              )}
              {task.extractionOptions && (
                <button type="button" className="btn btn-xs btn-outline" onClick={openExtractionOptionsModal}>
                  Options
                </button>
              )}
              {task.metadata && (
                <button type="button" className="btn btn-xs btn-outline" onClick={openMetadataModal}>
                  Metadata
                </button>
              )}
              <div className="text-base-content/40 ml-auto">ID: {task.id}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {task.extractionOptions && (
        <JsonModal ref={extractionOptionsModalRef} title="Extraction Options" data={task.extractionOptions} />
      )}

      {task.metadata && <JsonModal ref={metadataModalRef} title="Metadata" data={task.metadata} />}
    </>
  )
}

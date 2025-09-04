import { useRef } from 'react'
import { twMerge } from 'tailwind-merge'

import { dateTimeString, formatDuration } from '@george-ai/web-utils'

import { graphql } from '../../../gql'
import {
  AiContentProcessingTask_AccordionItemFragment,
  EmbeddingStatus,
  ExtractionStatus,
  ProcessingStatus,
} from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { JsonModal } from '../../json-modal'
import { TaskTimeline } from './task-timeline'

graphql(`
  fragment AiContentProcessingTask_AccordionItem on AiContentProcessingTask {
    id
    ...AiContentProcessingTask_Timeline
    file {
      id
      name
      library {
        fileConverterOptions
      }
    }
    createdAt
    timeoutMs
    metadata
    extractionOptions
    extractionStatus
    embeddingStatus
    processingTimeMs
    processingStatus
    chunksCount
    chunksSize
    extractionSubTasks {
      id
      extractionMethod
      markdownFileName
      startedAt
      finishedAt
      failedAt
    }
  }
`)

interface TaskAccordionItemProps {
  task: AiContentProcessingTask_AccordionItemFragment
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

  const extractionMethods = task.extractionSubTasks.map((subTask) => subTask.extractionMethod).join(', ')

  return (
    <>
      <div className="collapse-arrow join-item border-base-300 collapse border">
        <input type="radio" name={`task-accordion-${skip}-${take}`} defaultChecked={index === 0} className="peer" />
        <div className="collapse-title peer-checked:bg-base-100 font-semibold opacity-40 peer-checked:opacity-100">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-nowrap">{extractionMethods.length < 1 ? 'Unknown Method' : extractionMethods}</span>
              {!hideFileName && <span className="text-nowrap">{`${task.file.name}`}</span>}
              <span className="text-neutral/50 text-nowrap text-xs">{dateTimeString(task.createdAt, language)}</span>
            </div>
            <div className="flex gap-2">
              <span className={twMerge('badge badge-sm badge-outline', getStatusBadgeClass(task.extractionStatus))}>
                <svg className="size-3" fill="currentColor" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="8" />
                </svg>
                <span className="text-base-content/80">Extraction</span>
              </span>
              <span className={twMerge('badge badge-sm badge-outline', getStatusBadgeClass(task.embeddingStatus))}>
                <svg className="size-3" fill="currentColor" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="8" />
                </svg>
                <span className="text-base-content/80">Embedding</span>
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
                <span className="text-base-content/80">Processing</span>
              </span>
            </div>
          </div>
        </div>
        <div className="collapse-content bg-base-100 text-sm">
          <div className="space-y-4 pt-2">
            {/* Core Information - Compact 4-column grid */}
            <div className="flex items-center justify-around gap-6 text-xs">
              <div>
                <span className="text-base-content/60">Methods:</span>
                {extractionMethods.length < 1 ? '-' : <span>{extractionMethods}</span>}
              </div>
              <div>
                <span className="text-base-content/60">Total Duration:</span> {formatDuration(task.processingTimeMs)}
              </div>
              <div>
                <span className="text-base-content/60">Chunks:</span> {task.chunksCount || '-'}
              </div>
              <div>
                <span className="text-base-content/60">Size:</span>
                {task.chunksSize ? `${(task.chunksSize / 1024).toFixed(1)} KB` : '-'}
              </div>
              <div>
                <span className="text-base-content/60">Timeout:</span>
                {task.timeoutMs === undefined ? '-' : task.timeoutMs}ms
              </div>
              <div className="flex gap-2">
                <button type="button" className="btn btn-sm btn-circle" onClick={openExtractionOptionsModal}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.867 19.125h.008v.008h-.008v-.008Z" />
                  </svg>
                </button>
                {task.metadata && (
                  <button type="button" className="btn btn-sm btn-circle" onClick={openMetadataModal}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 12.75c1.148 0 2.278.08 3.383.237 1.037.146 1.866.966 1.866 2.013 0 3.728-2.35 6.75-5.25 6.75S6.75 18.728 6.75 15c0-1.046.83-1.867 1.866-2.013A24.204 24.204 0 0 1 12 12.75Zm0 0c2.883 0 5.647.508 8.207 1.44a23.91 23.91 0 0 1-1.152 6.06M12 12.75c-2.883 0-5.647.508-8.208 1.44.125 2.104.52 4.136 1.153 6.06M12 12.75a2.25 2.25 0 0 0 2.248-2.354M12 12.75a2.25 2.25 0 0 1-2.248-2.354M12 8.25c.995 0 1.971-.08 2.922-.236.403-.066.74-.358.795-.762a3.778 3.778 0 0 0-.399-2.25M12 8.25c-.995 0-1.97-.08-2.922-.236-.402-.066-.74-.358-.795-.762a3.734 3.734 0 0 1 .4-2.253M12 8.25a2.25 2.25 0 0 0-2.248 2.146M12 8.25a2.25 2.25 0 0 1 2.248 2.146M8.683 5a6.032 6.032 0 0 1-1.155-1.002c.07-.63.27-1.222.574-1.747m.581 2.749A3.75 3.75 0 0 1 15.318 5m0 0c.427-.283.815-.62 1.155-.999a4.471 4.471 0 0 0-.575-1.752M4.921 6a24.048 24.048 0 0 0-.392 3.314c1.668.546 3.416.914 5.223 1.082M19.08 6c.205 1.08.337 2.187.392 3.314a23.882 23.882 0 0 1-5.223 1.082"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Process Timeline - 3-Phase Pipeline */}
            <TaskTimeline task={task} />

            {/* Additional Data & Actions - Single row */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {task.extractionSubTasks
                .filter((subTask) => !!subTask.markdownFileName)
                .map((subTask) => (
                  <div key={subTask.markdownFileName} className="badge badge-ghost">
                    <span className="text-base-content/60">MD:</span> {subTask.markdownFileName}
                  </div>
                ))}

              <div className="text-base-content/40 ml-auto">ID: {task.id}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {task.extractionOptions && (
        <JsonModal
          ref={extractionOptionsModalRef}
          title="Extraction Options"
          data={JSON.stringify(
            { taskOptions: task.extractionOptions, libraryOptions: task.file.library.fileConverterOptions },
            null,
            2,
          )}
        />
      )}

      {task.metadata && <JsonModal ref={metadataModalRef} title="Metadata" data={task.metadata} />}
    </>
  )
}

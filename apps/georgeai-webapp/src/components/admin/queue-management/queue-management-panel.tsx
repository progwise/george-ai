import { useState } from 'react'

import { graphql } from '../../../gql'
import { QueueSystemStatus_ManagementPanelFragment, QueueType } from '../../../gql/graphql'
import { PlayIcon } from '../../../icons/play-icon'
import { ReprocessIcon } from '../../../icons/reprocess-icon'
import { StopIcon } from '../../../icons/stop-icon'
import { StopProcessingIcon } from '../../../icons/stop-processing-icon'
import { TrashIcon } from '../../../icons/trash-icon'
import { useQueueManagementActions } from './use-queue-management-actions'

graphql(`
  fragment QueueSystemStatus_ManagementPanel on QueueSystemStatus {
    allWorkersRunning
    totalPendingTasks
    totalProcessingTasks
    totalFailedTasks
    lastUpdated
    queues {
      queueType
      isRunning
      pendingTasks
      processingTasks
      failedTasks
      completedTasks
      lastProcessedAt
    }
  }
`)

interface QueueManagementPanelProps {
  queueStatus: QueueSystemStatus_ManagementPanelFragment
}

export function QueueManagementPanel({ queueStatus }: QueueManagementPanelProps) {
  const [selectedLibraryId, setSelectedLibraryId] = useState<string>('')

  const {
    startWorker,
    stopWorker,
    retryFailedTasks,
    clearFailedTasks,
    clearPendingTasks,
    cancelContentProcessingTasks,
    actionsPending,
  } = useQueueManagementActions()

  const getQueueDisplayName = (queueType: QueueType): string => {
    switch (queueType) {
      case QueueType.Enrichment:
        return 'Enrichment Queue'
      case QueueType.ContentProcessing:
        return 'Content Processing Queue'
      case QueueType.Automation:
        return 'Automation Queue'
      default: {
        const exhaustiveCheck: never = queueType
        throw new Error(`Unhandled queue type: ${exhaustiveCheck}`)
      }
    }
  }

  const getStatusBadge = (isRunning: boolean) => {
    return isRunning ? 'badge-success' : 'badge-error'
  }

  return (
    <div className="space-y-8">
      {/* Overall Status */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Pending Tasks</div>
          <div className="stat-value text-warning">{queueStatus.totalPendingTasks}</div>
          <div className="stat-desc">Waiting for processing</div>
        </div>

        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Processing Tasks</div>
          <div className="stat-value text-info">{queueStatus.totalProcessingTasks}</div>
          <div className="stat-desc">Currently being processed</div>
        </div>

        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Failed Tasks</div>
          <div className="stat-value text-error">{queueStatus.totalFailedTasks}</div>
          <div className="stat-desc">Need attention</div>
        </div>
      </div>

      {/* Library Filter */}
      {queueStatus.totalFailedTasks > 0 && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">Failed Task Actions</h3>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Filter by Library ID (optional):</span>
              </label>
              <input
                type="text"
                placeholder="Enter library ID to filter actions"
                className="input input-bordered"
                value={selectedLibraryId}
                onChange={(e) => setSelectedLibraryId(e.target.value)}
              />
              <label className="label">
                <span className="label-text-alt">Leave empty to affect all libraries</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Individual Queue Status */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Queue Details</h2>

        {queueStatus.queues.map((queue) => (
          <div key={queue.queueType} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="card-title">
                    {getQueueDisplayName(queue.queueType)}
                    <div className={`badge ${getStatusBadge(queue.isRunning)}`}>
                      {queue.isRunning ? 'Running' : 'Stopped'}
                    </div>
                    {!queue.isRunning && queue.processingTasks > 0 && (
                      <div className="badge badge-warning">{queue.processingTasks} still processing</div>
                    )}
                  </h3>
                  {queue.lastProcessedAt && (
                    <p className="text-sm opacity-70">
                      Last processed: {new Date(queue.lastProcessedAt).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  {queue.isRunning ? (
                    <button
                      className="btn btn-error btn-sm"
                      onClick={() => stopWorker({ queueType: queue.queueType })}
                      disabled={actionsPending}
                      type="button"
                    >
                      <StopIcon className="size-4" />
                      Stop Worker
                    </button>
                  ) : (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => startWorker({ queueType: queue.queueType })}
                      disabled={actionsPending}
                      type="button"
                    >
                      <PlayIcon className="size-4" />
                      Start Worker
                    </button>
                  )}
                </div>
              </div>

              {/* Task Statistics */}
              <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="stat bg-base-200 rounded p-3">
                  <div className="stat-title text-xs">Pending</div>
                  <div className="stat-value text-warning text-lg">{queue.pendingTasks}</div>
                </div>
                <div className="stat bg-base-200 rounded p-3">
                  <div className="stat-title text-xs">Processing</div>
                  <div className="stat-value text-info text-lg">{queue.processingTasks}</div>
                </div>
                <div className="stat bg-base-200 rounded p-3">
                  <div className="stat-title text-xs">Failed</div>
                  <div className="stat-value text-error text-lg">{queue.failedTasks}</div>
                </div>
                <div className="stat bg-base-200 rounded p-3">
                  <div className="stat-title text-xs">Completed</div>
                  <div className="stat-value text-success text-lg">{queue.completedTasks}</div>
                </div>
              </div>

              {/* Queue Actions */}
              <div className="mt-4 flex flex-wrap gap-2">
                {/* Failed Task Actions */}
                {queue.failedTasks > 0 && (
                  <>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => retryFailedTasks({ queueType: queue.queueType })}
                      disabled={actionsPending}
                      type="button"
                    >
                      <ReprocessIcon className="size-4" />
                      Retry Failed ({queue.failedTasks})
                    </button>
                    <button
                      className="btn btn-error btn-sm"
                      onClick={() => clearFailedTasks({ queueType: queue.queueType })}
                      disabled={actionsPending}
                      type="button"
                    >
                      <TrashIcon className="size-4" />
                      Clear Failed ({queue.failedTasks})
                    </button>
                  </>
                )}

                {/* Pending Task Actions */}
                {queue.pendingTasks > 0 && (
                  <button
                    className="btn btn-outline btn-warning btn-sm"
                    onClick={() => clearPendingTasks({ queueType: queue.queueType })}
                    disabled={actionsPending}
                    type="button"
                  >
                    <TrashIcon className="size-4" />
                    Clear Pending ({queue.pendingTasks})
                  </button>
                )}

                {/* Processing Task Actions - Only for Content Processing Queue */}
                {queue.queueType === 'CONTENT_PROCESSING' && queue.processingTasks > 0 && (
                  <button
                    className="btn btn-outline btn-error btn-sm"
                    onClick={() => cancelContentProcessingTasks({})}
                    disabled={actionsPending}
                    type="button"
                  >
                    <StopProcessingIcon className="size-4" />
                    Cancel Processing ({queue.processingTasks})
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

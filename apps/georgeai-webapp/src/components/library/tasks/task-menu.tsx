import { Link, useSearch } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

import { graphql } from '../../../gql'
import { ProcessingStatus, TaskMenu_FilesQueryResultFragment } from '../../../gql/graphql'
import { PlayIcon } from '../../../icons/play-icon'
import { TrashIcon } from '../../../icons/trash-icon'
import { DialogForm } from '../../dialog-form'
import { useTaskActions } from './use-task-actions'

graphql(`
  fragment TaskMenu_FilesQueryResult on AiLibraryFileQueryResult {
    count
    missingChunksCount
    missingContentExtractionTasksCount
  }
`)

interface TaskMenuProps {
  libraryId: string
  files: TaskMenu_FilesQueryResultFragment
  totalTasksCount: number
  statusCounts: { status: ProcessingStatus; count: number }[]
}

export const TaskMenu = ({ files, libraryId, totalTasksCount, statusCounts }: TaskMenuProps) => {
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const dropDialogRef = useRef<HTMLDialogElement>(null)
  const { status } = useSearch({ from: '/_authenticated/libraries/$libraryId/processing' })
  const { createMissingContentExtractionTasks, dropPendingTasks, isPending } = useTaskActions({ libraryId })

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (detailsRef.current && !detailsRef.current.contains(event.target as Node)) {
        detailsRef.current.open = false
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (detailsRef.current) {
      detailsRef.current.open = false
    }
  })

  const handleCreateMissingExtractionTasks = () => {
    createMissingContentExtractionTasks()
  }

  const handleDropPendingTasks = () => {
    dropPendingTasks()
    dropDialogRef.current?.close()
  }

  const currentStatusCount = statusCounts.find((s) => s.status === status)
  const pendingCount = statusCounts.find((s) => s.status === ProcessingStatus.Pending)?.count ?? 0

  return (
    <>
      <ul className="menu w-full flex-nowrap items-center gap-2 menu-sm rounded-box bg-base-200 shadow-lg md:menu-horizontal">
        <li className="menu-title">Content Extraction Tasks</li>
        <li>
          <details ref={detailsRef}>
            <summary className="text-sm font-medium">
              {currentStatusCount
                ? `${currentStatusCount.count} ${currentStatusCount.status}`
                : `${totalTasksCount} all`}
            </summary>
            <ul className="z-40">
              <li>
                <Link to="." search={{ status: undefined }}>
                  {totalTasksCount} all
                </Link>
              </li>
              {statusCounts.map(({ status, count }) => (
                <li key={status}>
                  <Link to="." search={{ status }} className="text-nowrap">
                    {count} {status}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        </li>
        <li>
          <div className="flex">
            <span className="badge badge-sm badge-neutral">Files: {files.count}</span>
            <span className="badge badge-sm badge-accent">Without chunks: {files.missingChunksCount}</span>
          </div>
        </li>
        <li className="grow items-end">
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-sm"
              onClick={handleCreateMissingExtractionTasks}
              disabled={files.missingContentExtractionTasksCount === 0 || isPending}
            >
              {isPending ? <span className="loading loading-xs loading-spinner" /> : <PlayIcon className="size-4" />}
              <span>Create {files.missingContentExtractionTasksCount} tasks</span>
            </button>

            <button
              type="button"
              className="btn btn-sm"
              onClick={() => dropDialogRef.current?.showModal()}
              disabled={pendingCount === 0 || isPending}
            >
              {isPending ? <span className="loading loading-xs loading-spinner" /> : <TrashIcon className="size-4" />}
              <span>drop {pendingCount} pending tasks</span>
            </button>
          </div>
        </li>
      </ul>

      <DialogForm
        ref={dropDialogRef}
        title="Drop Pending Tasks"
        description={`Are you sure you want to drop ${pendingCount} pending task${pendingCount === 1 ? '' : 's'}? This cannot be undone.`}
        onSubmit={handleDropPendingTasks}
        submitButtonText="Drop Tasks"
      >
        <div className="py-2">
          <p className="text-warning">
            ⚠️ This will permanently delete all pending content extraction tasks that have not started processing yet.
          </p>
        </div>
      </DialogForm>
    </>
  )
}

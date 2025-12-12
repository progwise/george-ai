import { Link, useParams } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { formatBytes } from '@george-ai/web-utils'

import { graphql } from '../../../gql'
import { AiLibraryFile_TableItemFragment, ExtractionStatus, ProcessingStatus } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { ArchiveIcon } from '../../../icons/archive-icon'
import { CalendarIcon } from '../../../icons/calendar-icon'
import { CheckIcon } from '../../../icons/check-icon'
import { ExclamationIcon } from '../../../icons/exclamation-icon'
import { EyeIcon } from '../../../icons/eye-icon'
import { PlayIcon } from '../../../icons/play-icon'
import { ReprocessIcon } from '../../../icons/reprocess-icon'
import { SparklesIcon } from '../../../icons/sparkles-icon'
import { TrashIcon } from '../../../icons/trash-icon'
import { ClientDate } from '../../client-date'
import { DialogForm } from '../../dialog-form'
import { useFileActions } from './use-file-actions'

const truncateFileName = (name: string, maxLength: number, truncatedLength: number) =>
  name.length > maxLength ? `${name.slice(0, truncatedLength)}...${name.slice(name.lastIndexOf('.'))}` : name

graphql(`
  fragment AiLibraryFile_TableItem on AiLibraryFile {
    id
    libraryId
    name
    originUri
    mimeType
    size
    uploadedAt
    dropError
    createdAt
    originModificationDate
    archivedAt
    taskCount
    processingStatus
    extractionStatus
    embeddingStatus
    lastSuccessfulEmbedding {
      id
      createdAt
      processingFinishedAt
      chunksCount
      chunksSize
    }
  }
`)
interface FilesTableProps {
  files: AiLibraryFile_TableItemFragment[]
  firstItemNumber: number
}
export const FilesTable = ({ files, firstItemNumber }: FilesTableProps) => {
  const { t } = useTranslation()
  const { libraryId } = useParams({ from: '/_authenticated/libraries/$libraryId' })
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([])
  const pageFileIds = files?.map((file) => file.id) || []
  const allSelected = pageFileIds.every((id) => selectedFileIds.includes(id))

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSelectedFileIds([])
    }, 500)
    return () => clearTimeout(timeout)
  }, [libraryId])

  const { dropFile, dropFiles, createExtractionTasks, createEmbeddingTasks, fileActionPending } = useFileActions({
    libraryId,
  })

  const dropDialogRef = useRef<HTMLDialogElement>(null)
  const processDialogRef = useRef<HTMLDialogElement>(null)
  const embedDialogRef = useRef<HTMLDialogElement>(null)
  const detailsRef = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (detailsRef.current && !detailsRef.current.contains(event.target as Node)) {
        detailsRef.current.open = false
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSelectFile = (fileId: string) => {
    setSelectedFileIds((prev) => (prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]))
  }

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedFileIds((prev) => prev.filter((id) => !pageFileIds.includes(id)))
    } else {
      setSelectedFileIds((prev) => Array.from(new Set([...prev, ...pageFileIds])))
    }
  }

  const handleDropSelectedFiles = () => {
    dropFiles(selectedFileIds, {
      onSettled: () => {
        setSelectedFileIds([])
        dropDialogRef.current?.close()
      },
    })
  }

  const handleProcessSelectedFiles = () => {
    createExtractionTasks(selectedFileIds, {
      onSettled: () => {
        setSelectedFileIds([])
        processDialogRef.current?.close()
      },
    })
  }

  const handleEmbedSelectedFiles = () => {
    createEmbeddingTasks(selectedFileIds, {
      onSettled: () => {
        setSelectedFileIds([])
        embedDialogRef.current?.close()
      },
    })
  }

  return (
    <>
      {/* Mobile View */}
      <div className="block lg:hidden">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <label className="flex gap-2">
            <input type="checkbox" className="checkbox checkbox-sm" checked={allSelected} onChange={handleSelectAll} />
            <span className="text-sm font-medium">{t('actions.selectAll')}</span>
          </label>

          {selectedFileIds.length > 0 && (
            <>
              <button type="button" className="btn btn-ghost btn-xs" onClick={() => dropDialogRef.current?.showModal()}>
                <TrashIcon className="size-4" />
                {t('actions.dropSelected', { count: selectedFileIds.length })}
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                onClick={() => processDialogRef.current?.showModal()}
              >
                <ReprocessIcon className="size-4" />
                {t('actions.processSelected', { count: selectedFileIds.length })}
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                onClick={() => embedDialogRef.current?.showModal()}
              >
                <SparklesIcon className="size-4" />
                {t('actions.embedSelected', { count: selectedFileIds.length })}
              </button>
            </>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
          {files.map((file, index) => (
            <div
              key={file.id}
              className={`flex flex-col gap-2 rounded-md border border-base-300 p-3 shadow-xs ${
                index % 2 === 0 ? 'bg-base-100 dark:bg-base-100' : 'bg-base-200 dark:bg-base-200'
              }`}
            >
              <div className="flex justify-between">
                <label className="flex min-w-0 flex-1 items-center gap-2">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={selectedFileIds.includes(file.id)}
                    onChange={() => handleSelectFile(file.id)}
                  />
                  <span
                    className="inline-block max-w-[calc(100vw-140px)] truncate text-sm font-semibold"
                    title={file.name}
                  >
                    <Link
                      to="/libraries/$libraryId/files/$fileId"
                      params={{ libraryId: file.libraryId, fileId: file.id }}
                    >
                      {`${index + 1}. ${truncateFileName(file.name, 49, 45)}`}
                    </Link>
                  </span>
                </label>
                <div className="flex shrink-0 justify-end gap-2">
                  {file.archivedAt && (
                    <span className="badge gap-1 badge-outline badge-sm">
                      <ArchiveIcon className="size-3" />
                      {t('labels.archived')}
                    </span>
                  )}
                  {file.extractionStatus !== ExtractionStatus.None && (
                    <span
                      className={twMerge(
                        'badge gap-1 badge-sm',
                        file.extractionStatus === ExtractionStatus.Pending && 'badge-info',
                        file.extractionStatus === ExtractionStatus.Running && 'badge-primary',
                        file.extractionStatus === ExtractionStatus.Completed && 'badge-success',
                        file.extractionStatus === ExtractionStatus.Failed && 'badge-error',
                      )}
                      title={file.extractionStatus}
                    >
                      {file.extractionStatus === ExtractionStatus.Pending && <CalendarIcon className="size-3" />}
                      {file.extractionStatus === ExtractionStatus.Running && <PlayIcon className="size-3" />}
                      {file.extractionStatus === ExtractionStatus.Completed && <CheckIcon className="size-3" />}
                      {file.extractionStatus === ExtractionStatus.Failed && <ExclamationIcon className="size-3" />}
                      {file.extractionStatus}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1 text-sm">
                <span>{t('labels.size')}:</span>
                <span>{file.size ?? '-'}</span>
                <span>{t('labels.chunks')}:</span>
                <span>{file.lastSuccessfulEmbedding?.chunksCount ?? '-'}</span>
                <span>{t('labels.processed')}:</span>
                <ClientDate date={file.lastSuccessfulEmbedding?.processingFinishedAt} format="dateTime" fallback="-" />
                {file.originModificationDate && (
                  <>
                    <span>{t('labels.originModified')}:</span>
                    <ClientDate date={file.originModificationDate} format="dateTime" />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden size-full overflow-auto lg:block">
        <table className="table-pin-rows table-pin-cols table table-zebra table-sm">
          <thead>
            <tr>
              <th>
                <div className="flex flex-row flex-nowrap justify-between text-sm">
                  <input
                    type="checkbox"
                    className="checkbox m-0 checkbox-xs p-0 text-xs"
                    checked={allSelected}
                    onChange={handleSelectAll}
                  />
                  <span>{selectedFileIds.length}</span>

                  <button
                    type="button"
                    className="tooltip btn tooltip-right btn-square btn-xs"
                    onClick={() => embedDialogRef.current?.showModal()}
                    data-tip={t('actions.embedSelected', { count: selectedFileIds.length })}
                    disabled={selectedFileIds.length === 0}
                  >
                    <SparklesIcon className="size-4" />
                  </button>
                  <button
                    type="button"
                    className="tooltip btn tooltip-right btn-square btn-xs"
                    onClick={() => dropDialogRef.current?.showModal()}
                    data-tip={t('actions.dropSelected', { count: selectedFileIds.length })}
                    disabled={selectedFileIds.length === 0}
                  >
                    <TrashIcon className="size-4" />
                  </button>
                  <button
                    type="button"
                    className="tooltip btn tooltip-right btn-square btn-xs"
                    onClick={() => processDialogRef.current?.showModal()}
                    data-tip={t('actions.processSelected', { count: selectedFileIds.length })}
                    disabled={selectedFileIds.length === 0}
                  >
                    <ReprocessIcon className="size-4" />
                  </button>
                </div>
              </th>
              <td>{t('labels.name')}</td>
              <td>#{t('labels.size')}</td>
              <td>
                #{t('labels.conversions')}/ #{t('labels.chunks')}
              </td>
              <td>{t('labels.processed')}</td>
              <td>{t('labels.originModified')}</td>
            </tr>
          </thead>
          <tbody>
            {files.map((file, index) => (
              <tr key={file.id} className="hover:bg-base-300">
                <th>
                  <div className="flex items-center justify-between">
                    <div className="text-nowrap">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-xs"
                        checked={selectedFileIds.includes(file.id)}
                        onChange={() => handleSelectFile(file.id)}
                      />
                      <span className="ml-3">{index + (firstItemNumber ?? 1)}</span>
                    </div>
                    <div className="flex gap-1">
                      <Link
                        to="/libraries/$libraryId/files/$fileId"
                        params={{ libraryId: file.libraryId, fileId: file.id }}
                        className="tooltip btn tooltip-right btn-square btn-xs"
                        data-tip={t('actions.view')}
                      >
                        <EyeIcon className="size-4" />
                      </Link>
                      <button
                        type="button"
                        disabled={fileActionPending}
                        className="tooltip btn tooltip-right btn-square btn-xs"
                        data-tip={t('actions.drop')}
                        onClick={() => dropFile(file.id)}
                      >
                        <TrashIcon className="size-4" />
                      </button>
                      <button
                        type="button"
                        className="tooltip btn tooltip-right btn-square btn-xs"
                        data-tip={t('actions.reprocess')}
                        onClick={() => createExtractionTasks([file.id])}
                      >
                        <ReprocessIcon className="size-4" />
                      </button>
                      {file.processingStatus === ProcessingStatus.Failed && (
                        <span className="tooltip tooltip-right" data-tip={file.processingStatus}>
                          <ExclamationIcon className="size-4" />
                        </span>
                      )}

                      {file.dropError && (
                        <span className="tooltip-right lg:tooltip" data-tip={t('libraries.dropFileError')}>
                          <ExclamationIcon className="size-4 fill-warning" />
                        </span>
                      )}
                    </div>
                  </div>
                </th>

                <td className="flex flex-col truncate" title={file.name}>
                  <div className="flex items-center gap-2">
                    <Link
                      to="/libraries/$libraryId/files/$fileId"
                      params={{ libraryId: file.libraryId, fileId: file.id }}
                    >
                      <span>{truncateFileName(file.name, 49, 45)}</span>
                    </Link>
                    {file.archivedAt && (
                      <span className="badge gap-1 badge-xs badge-warning">
                        <ArchiveIcon className="size-3" />
                        {t('labels.archived')}
                      </span>
                    )}
                  </div>
                  <a href={file.originUri || '#'} target="_blank" className="link text-xs" rel="noopener noreferrer">
                    {file.originUri || 'n/a'}
                  </a>
                </td>
                <td className="text-nowrap">{formatBytes(file.size) ?? '-'}</td>
                <td>
                  {file.taskCount ?? '-'}/{file.lastSuccessfulEmbedding?.chunksCount ?? '-'}
                </td>
                <td className="text-nowrap">
                  <ClientDate date={file.lastSuccessfulEmbedding?.processingFinishedAt} format="dateTime" fallback="" />
                </td>
                <td className="text-nowrap">
                  <ClientDate date={file.originModificationDate} format="dateTime" fallback="" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmation Dialogs */}
      <DialogForm
        ref={dropDialogRef}
        title={t('libraries.dropFilesDialog')}
        description={t('texts.dropFilesDialogDescription')}
        onSubmit={handleDropSelectedFiles}
        submitButtonText={t('actions.drop')}
        disabledSubmit={fileActionPending}
      >
        <div className="w-full">
          <div className="mb-4">
            <span className="font-medium">
              {t('texts.numberOfFilesToBeDropped', { count: selectedFileIds.length })}
            </span>
          </div>
        </div>
      </DialogForm>

      <DialogForm
        ref={processDialogRef}
        title={t('libraries.processFilesDialog')}
        description={t('texts.processFilesDialogDescription')}
        onSubmit={handleProcessSelectedFiles}
        submitButtonText={t('actions.reprocess')}
        disabledSubmit={fileActionPending}
      >
        <div className="w-full">
          <div className="mb-4">
            <span className="font-medium">{t('actions.processSelected', { count: selectedFileIds.length })}</span>
          </div>
        </div>
      </DialogForm>

      <DialogForm
        ref={embedDialogRef}
        title={t('libraries.embedFilesDialog')}
        description={t('texts.embedFilesDialogDescription')}
        onSubmit={handleEmbedSelectedFiles}
        submitButtonText={t('actions.reembed')}
        disabledSubmit={fileActionPending}
      >
        <div className="w-full">
          <div className="mb-4">
            <span className="font-medium">{t('actions.embedSelected', { count: selectedFileIds.length })}</span>
          </div>
        </div>
      </DialogForm>
    </>
  )
}

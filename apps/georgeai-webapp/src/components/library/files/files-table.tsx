import { Link, useParams } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { dateTimeStringShort } from '@george-ai/app-commons'
import { formatBytes } from '@george-ai/web-utils'

import { graphql } from '../../../gql'
import { AiLibraryFile_FilesTableFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { ArchiveIcon } from '../../../icons/archive-icon'
import { CalendarIcon } from '../../../icons/calendar-icon'
import { CheckIcon } from '../../../icons/check-icon'
import { ExclamationIcon } from '../../../icons/exclamation-icon'
import { EyeIcon } from '../../../icons/eye-icon'
import { ReprocessIcon } from '../../../icons/reprocess-icon'
import { SparklesIcon } from '../../../icons/sparkles-icon'
import { TrashIcon } from '../../../icons/trash-icon'
import { ClientDate } from '../../client-date'
import { DialogForm } from '../../dialog-form'
import { toastSuccess } from '../../georgeToaster'
import { useLibraryActions } from '../use-library-actions'

const truncateFileName = (name: string, maxLength: number, truncatedLength: number) =>
  name.length > maxLength ? `${name.slice(0, truncatedLength)}...${name.slice(name.lastIndexOf('.'))}` : name

graphql(`
  fragment AiLibrary_FilesTable on AiLibrary {
    id
    name
    manifest {
      name
    }
  }
`)

graphql(`
  fragment AiLibraryFile_FilesTable on AiLibraryFile {
    id
    libraryId
    name
    originUri
    mimeType
    size
    dropError
    createdAt
    originModificationDate
    archivedAt
    chunkCount
    manifest {
      version
      documentId
      name
      mimeType
      sourceHash
      created
      origin {
        uri
        hash
        creationDate
        lastModifiedDate
        author
      }
      extractions {
        extractionMethod
        sourceHash
        created
        updated
      }
      storageStats {
        extractionBytes
        attachmentBytes
        physicalBytes
        extractionFileCount
        physicalFileCount
        attachmentFileCount
        lastUpdate
        lastReconcile
      }
    }
  }
`)
interface FilesTableProps {
  files: AiLibraryFile_FilesTableFragment[]
  firstItemNumber: number
}
export const FilesTable = ({ files, firstItemNumber }: FilesTableProps) => {
  const { t, language } = useTranslation()
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

  const { deleteFile, deleteFiles, triggerExtraction, triggerVectorization, isPending } = useLibraryActions(libraryId)

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
    deleteFiles(selectedFileIds, {
      onSettled: () => {
        setSelectedFileIds([])
        dropDialogRef.current?.close()
      },
    })
  }

  const handleExtractSelectedFiles = () => {
    for (const documentId of selectedFileIds) {
      triggerExtraction({ documentId })
    }
    toastSuccess(`Extraction of ${selectedFileIds.length} documents triggered. `)
  }

  const handleEmbedSelectedFiles = () => {
    for (const documentId of selectedFileIds) {
      triggerVectorization({ documentId })
    }
    toastSuccess(`Vectorizatrion of ${selectedFileIds.length} documents triggered. `)
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
                  {!file.manifest ? (
                    <span
                      className="badge gap-1 badge-outline badge-sm badge-warning"
                      title={t('errors.fileMissingInfo')}
                    >
                      <ExclamationIcon className="size-3" />
                      {t('errors.missingInfo')}
                    </span>
                  ) : file.manifest.extractions.length === 0 ? (
                    <span className="badge gap-1 badge-outline badge-sm badge-info" title={t('files.noExtractionsYet')}>
                      <CalendarIcon className="size-3" />
                      {t('files.noExtractions')}
                    </span>
                  ) : (
                    file.manifest.extractions
                      .sort(
                        (a, b) =>
                          new Date(a.updated || a.created).getTime() - new Date(b.updated || b.created).getTime(),
                      )
                      .map((extraction) => (
                        <span
                          key={`${file.id}-extraction-${extraction.extractionMethod}`}
                          className={twMerge(
                            'badge gap-1 badge-sm',
                            file.manifest?.sourceHash === extraction.sourceHash ? 'badge-success' : 'badge-warning',
                          )}
                          title={`${t('files.extractionMethod')}: ${extraction.extractionMethod}`}
                        >
                          {file.manifest?.sourceHash === extraction.sourceHash ? (
                            <CheckIcon className="size-3" />
                          ) : (
                            <ExclamationIcon className="size-3" />
                          )}
                          {`${extraction.extractionMethod} (${dateTimeStringShort(extraction.updated || extraction.created, language)})`}
                        </span>
                      ))
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1 text-sm">
                <span>{t('labels.size')}:</span>
                <span>{file.size ?? '-'}</span>
                <span>{t('labels.chunks')}:</span>
                <span>{file.chunkCount !== null && file.chunkCount !== undefined ? file.chunkCount : '-'}</span>
                <span>{t('labels.processed')}:</span>
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
      <div className="hidden h-full lg:block">
        <table className="table-pin-rows table-pin-cols table table-zebra">
          <thead>
            <tr>
              <th>
                <div className="flex flex-row flex-nowrap items-center justify-between text-sm">
                  <input
                    type="checkbox"
                    className="checkbox m-0 checkbox-xs p-0 text-xs"
                    checked={allSelected}
                    onChange={handleSelectAll}
                  />
                  <span>{selectedFileIds.length}</span>

                  <button
                    type="button"
                    className="tooltip btn tooltip-right z-20 btn-square btn-xs"
                    onClick={() => embedDialogRef.current?.showModal()}
                    data-tip={t('actions.embedSelected', { count: selectedFileIds.length })}
                    disabled={selectedFileIds.length === 0}
                  >
                    <SparklesIcon className="size-4" />
                  </button>
                  <button
                    type="button"
                    className="tooltip btn tooltip-right z-10 btn-square btn-xs"
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
                #{t('labels.activeExtractions')}/ #{t('labels.extractions')}
              </td>
              <td>{t('labels.lastUpdate')}</td>
              <td>{t('labels.lastReconcile')}</td>
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
                        className="tooltip btn tooltip-right z-20 btn-square btn-xs"
                        data-tip={t('actions.view')}
                      >
                        <EyeIcon className="size-4" />
                      </Link>
                      <button
                        type="button"
                        disabled={isPending}
                        className="tooltip btn tooltip-right z-10 btn-square btn-xs"
                        data-tip={t('actions.drop')}
                        onClick={() => deleteFile(file.id)}
                      >
                        <TrashIcon className="size-4" />
                      </button>
                      <button
                        type="button"
                        className="tooltip btn tooltip-right btn-square btn-xs"
                        data-tip={t('actions.reprocess')}
                        onClick={() => triggerExtraction({ documentId: file.id })}
                      >
                        <ReprocessIcon className="size-4" />
                      </button>

                      {file.dropError && (
                        <span className="tooltip-right lg:tooltip" data-tip={t('libraries.dropFileError')}>
                          <ExclamationIcon className="size-4 fill-warning" />
                        </span>
                      )}
                    </div>
                  </div>
                </th>

                <td className="truncate" title={file.name}>
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
                </td>
                <td className="text-nowrap">{formatBytes(file.size) ?? '-'}</td>
                <td>
                  {file.manifest?.extractions.filter(
                    (extraction) => extraction.sourceHash === file.manifest?.sourceHash,
                  ).length ?? '-'}
                  /{file.manifest?.extractions.length ?? '-'}
                </td>
                <td className="text-nowrap">
                  <ClientDate
                    date={file?.manifest?.origin?.lastModifiedDate || file?.manifest?.origin?.creationDate}
                    format="dateTime"
                    fallback=""
                  />
                </td>
                <td className="text-nowrap">
                  <ClientDate date={file?.manifest?.storageStats.lastReconcile} format="dateTime" fallback="" />
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
        disabledSubmit={isPending}
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
        onSubmit={handleExtractSelectedFiles}
        submitButtonText={t('actions.reprocess')}
        disabledSubmit={isPending}
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
        disabledSubmit={isPending}
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

import { useMutation } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

import { dateTimeString } from '@george-ai/web-utils'

import { graphql } from '../../../gql'
import { AiLibraryFile_TableItemFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { ExclamationIcon } from '../../../icons/exclamation-icon'
import { toastError, toastSuccess } from '../../georgeToaster'
import { LoadingSpinner } from '../../loading-spinner'
import { dropFiles, reprocessFiles } from './change-files'

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
    chunks
    uploadedAt
    processedAt
    processingErrorMessage
    dropError
    originModificationDate
  }
`)
interface FilesTableProps {
  files: AiLibraryFile_TableItemFragment[]
  firstItemNumber: number
  selectedFileIds: string[]
  setSelectedFileIds: React.Dispatch<React.SetStateAction<string[]>>
  tableDataChanged: () => void
}
export const FilesTable = ({
  files,
  firstItemNumber,
  selectedFileIds,
  setSelectedFileIds,
  tableDataChanged,
}: FilesTableProps) => {
  const { t, language } = useTranslation()
  const pageFileIds = files?.map((file) => file.id) || []
  const allSelected = pageFileIds.every((id) => selectedFileIds.includes(id))

  const { mutate: mutateDropFile, isPending: dropPending } = useMutation({
    mutationFn: (fileId: string) => dropFiles({ data: [fileId] }),
    onError: (error: Error) => {
      const errorMessage = error instanceof Error ? `${error.message}: ${error.cause}` : ''
      console.error('Error dropping file:', { error: errorMessage })
      toastError(t('errors.dropFile', { error: errorMessage }))
    },
    onSuccess: (data) => {
      if (data.length < 1) {
        toastError(t('errors.dropFiles', { count: 0, error: 'no Files dropped' }))
        return
      }
      const droppedFile = data[0].dropFile
      setSelectedFileIds((prev) => prev.filter((id) => id !== droppedFile.id))
      toastSuccess(t('actions.dropSuccess', { count: 1 }) + `: ${droppedFile.name}`)
    },
    onSettled: () => {
      tableDataChanged()
    },
  })

  const { mutate: mutateReprocessFile, isPending: reprocessPending } = useMutation({
    mutationFn: (fileId: string) => reprocessFiles({ data: [fileId] }),
    onError: (error: Error) => {
      console.error('Error reprocessing file:', error)
      toastError(t('errors.reprocessFile', { error: error.message }))
    },
    onSuccess: (data) => {
      if (data.length !== 1) {
        toastError(t('errors.reprocessFile', { error: 'no Files re-processed' }))
        return
      }
      if (data[0].processFile.processingErrorMessage) {
        toastError(t('errors.reprocessFile', { error: data[0].processFile.processingErrorMessage }))
        return
      }
      toastSuccess(t('actions.reprocessSuccess', { count: 1 }) + `: ${data[0].processFile.name}`)
    },
    onSettled: () => {
      tableDataChanged()
    },
  })

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

  return (
    <>
      <LoadingSpinner isLoading={dropPending || reprocessPending} />
      {/* Mobile View */}
      <div className="block lg:hidden">
        <label className="mb-4 flex gap-2">
          <input type="checkbox" className="checkbox checkbox-sm" checked={allSelected} onChange={handleSelectAll} />
          <span className="text-sm font-medium">{t('actions.selectAll')}</span>
        </label>

        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
          {files.map((file, index) => (
            <div
              key={file.id}
              className={`shadow-xs border-base-300 flex flex-col gap-2 rounded-md border p-3 ${
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
                    <a href={file.originUri || '#'} target="_blank">
                      {`${index + 1}. ${truncateFileName(file.name, 49, 45)}`}
                    </a>
                  </span>
                </label>
                <div className="flex flex-shrink-0 justify-end gap-2">
                  {file.processingErrorMessage && (
                    <span className="tooltip tooltip-left flex items-center" data-tip={file.processingErrorMessage}>
                      <ExclamationIcon />
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1 text-sm">
                <span className="">{t('labels.size')}:</span>
                <span>{file.size ?? '-'}</span>
                <span className="">{t('labels.chunks')}:</span>
                <span>{file.chunks ?? '-'}</span>
                <span className="">{t('labels.processed')}:</span>
                <span>{dateTimeString(file.processedAt, language) || '-'}</span>
                {file.originModificationDate && (
                  <>
                    <span className="">{t('labels.originModified')}:</span>
                    <span>{dateTimeString(file.originModificationDate, language)}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block">
        <table className="table">
          <thead className="bg-base-200">
            <tr>
              <th>
                <input
                  type="checkbox"
                  className="checkbox checkbox-xs"
                  checked={allSelected}
                  onChange={handleSelectAll}
                />
              </th>
              <th>#</th>
              <th>{t('labels.name')}</th>
              <th>#{t('labels.size')}</th>
              <th>#{t('labels.chunks')}</th>
              <th>{t('labels.processed')}</th>
              <th>{t('labels.originModified')}</th>
              <th>{t('labels.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {files?.map((file, index) => (
              <tr key={file.id} className="hover:bg-base-200">
                <td>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-xs"
                    checked={selectedFileIds.includes(file.id)}
                    onChange={() => handleSelectFile(file.id)}
                  />
                </td>
                <td>{index + (firstItemNumber ?? 1)}</td>

                <td className="flex max-w-2xl flex-col truncate" title={file.name}>
                  <span>{truncateFileName(file.name, 49, 45)}</span>
                  <a href={file.originUri || '#'} target="_blank" className="link text-xs" rel="noopener noreferrer">
                    {file.originUri || 'n/a'}
                  </a>
                </td>
                <td>{file.size ?? '-'}</td>
                <td>{file.chunks ?? '-'}</td>
                <td>{dateTimeString(file.processedAt, language) || '-'}</td>
                <td>{file.originModificationDate ? dateTimeString(file.originModificationDate, language) : '-'}</td>
                <td className="flex items-center gap-2">
                  <Link
                    to="/libraries/$libraryId/files/$fileId"
                    params={{ libraryId: file.libraryId, fileId: file.id }}
                    className="btn btn-xs"
                  >
                    {t('actions.view')}
                  </Link>
                  <button
                    type="button"
                    disabled={dropPending}
                    className="btn btn-xs"
                    onClick={() => mutateDropFile(file.id)}
                  >
                    {t('actions.drop')}
                  </button>
                  <button type="button" className="btn btn-xs" onClick={() => mutateReprocessFile(file.id)}>
                    {t('actions.reprocess')}
                  </button>
                  {file.processingErrorMessage && (
                    <span className="tooltip" data-tip={file.processingErrorMessage}>
                      <ExclamationIcon />
                    </span>
                  )}

                  {file.dropError && (
                    <span className="lg:tooltip" data-tip={t('libraries.dropFileError')}>
                      <ExclamationIcon className="fill-warning" />
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

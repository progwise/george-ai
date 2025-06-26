import { useMutation } from '@tanstack/react-query'

import { dateTimeString } from '@george-ai/web-utils'

import { graphql } from '../../../gql'
import { AiLibraryFile_TableItemFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { ExclamationIcon } from '../../../icons/exclamation-icon'
import { toastError, toastSuccess } from '../../georgeToaster'
import { dropFiles, reprocessFiles } from './change-files'

const truncateFileName = (name: string, maxLength: number, truncatedLength: number) =>
  name.length > maxLength ? `${name.slice(0, truncatedLength)}...${name.slice(name.lastIndexOf('.'))}` : name

graphql(`
  fragment AiLibraryFile_TableItem on AiLibraryFile {
    id
    name
    originUri
    mimeType
    size
    chunks
    uploadedAt
    processedAt
    processingErrorMessage
    dropError
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

  const { mutate: mutateDropFile } = useMutation({
    mutationFn: (fileId: string) => dropFiles({ data: [fileId] }),
    onError: (error: Error) => {
      console.error('Error dropping file:', error)
      toastError(t('errors.dropFile', { error: error.message }))
    },
    onSuccess: (data) => {
      setSelectedFileIds((prev) => prev.filter((id) => !files.some((file) => file.id === id)))
      const fileNames = data.map((file) => (!file.dropFile.name ? file.dropFile.id : file.dropFile.name)).join(', ')
      toastSuccess(t('actions.dropSuccess', { count: 1 }) + `: ${fileNames}`)
    },
    onSettled: () => {
      tableDataChanged()
    },
  })

  const { mutate: mutateReProcessFile } = useMutation({
    mutationFn: (fileId: string) => reprocessFiles({ data: [fileId] }),
    onError: (error: Error) => {
      console.error('Error reprocessing file:', error)
      toastError(t('errors.reProcessFile', { error: error.message }))
    },
    onSuccess: (data) => {
      const fileNames = data
        .map((file) => (!file.processFile.name ? file.processFile.id : file.processFile.name))
        .join(', ')
      toastSuccess(t('actions.reProcessSuccess', { count: 1 }) + `: ${fileNames}`)
    },
    onSettled: () => {
      tableDataChanged()
    },
  })

  const handleSelectFile = (fileId: string) => {
    setSelectedFileIds((prev) => (prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]))
  }

  const handleSelectAll = () => {
    if (selectedFileIds.length === files?.length) {
      setSelectedFileIds([])
    } else {
      setSelectedFileIds(files?.map((file) => file.id) || [])
    }
  }

  return (
    <>
      {/* Mobile View */}
      <div className="block lg:hidden">
        <label className="mb-4 flex gap-2">
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={selectedFileIds.length === files.length && files.length > 0}
            onChange={handleSelectAll}
          />
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
                  checked={selectedFileIds.length === files?.length && files.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th>#</th>
              <th>{t('labels.name')}</th>
              <th>#{t('labels.size')}</th>
              <th>#{t('labels.chunks')}</th>
              <th>{t('labels.processed')}</th>
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
                <td className="flex items-center gap-2">
                  <button type="button" className="btn btn-xs" onClick={() => mutateDropFile(file.id)}>
                    {t('actions.drop')}
                  </button>
                  <button type="button" className="btn btn-xs" onClick={() => mutateReProcessFile(file.id)}>
                    {t('actions.reProcess')}
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

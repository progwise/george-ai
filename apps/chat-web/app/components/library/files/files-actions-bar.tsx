import { useMutation } from '@tanstack/react-query'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { toastError, toastSuccess } from '../../georgeToaster'
import { LoadingSpinner } from '../../loading-spinner'
import { reprocessFiles } from './change-files'
import { DesktopFileUpload } from './desktop-file-upload'
import { DropAllFilesDialog } from './drop-all-files-dialog'
import { DropFilesDialog } from './drop-files-dialog'
import { GoogleFileUploadButton } from './google-file-upload'
import { ProcessUnprocessedDialog } from './process-unprocessed'

interface FilesActionsBarProps {
  libraryId: string
  usedStorage: number
  availableStorage: number
  tableDataChanged: () => void
  checkedFileIds: string[]
  setCheckedFileIds: (fileIds: string[]) => void
  totalItems: number
  unprocessedFileCount: number
}

export const FilesActionsBar = ({
  libraryId,
  usedStorage,
  availableStorage,
  tableDataChanged,
  checkedFileIds,
  setCheckedFileIds,
  totalItems,
  unprocessedFileCount,
}: FilesActionsBarProps) => {
  const { t, tx } = useTranslation()

  const { mutate: reprocessFilesMutate, isPending: reprocessFilesPending } = useMutation({
    mutationFn: async (fileIds: string[]) => reprocessFiles({ data: fileIds }),
    onSettled: () => {
      setCheckedFileIds([])
      tableDataChanged()
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : t('errors.reprocessFiles', { error: 'Unknown error', files: '' })
      toastError(errorMessage)
    },
    onSuccess: (data) => {
      const errorFiles = data.filter(
        (file) => file.processFile.processingErrorMessage && file.processFile.processingErrorMessage.length > 0,
      )
      const successFiles = data.filter(
        (file) => !file.processFile.processingErrorMessage || file.processFile.processingErrorMessage.length === 0,
      )
      if (errorFiles.length > 0) {
        const errorFileNames = errorFiles.map((file) => file.processFile.name || file.processFile.id)
        toastError(
          tx('errors.reprocessFiles', {
            count: errorFileNames.length,
            files: (
              <ul>
                {errorFileNames.map((fileName) => (
                  <li key={fileName}>{fileName}</li>
                ))}
              </ul>
            ),
          }),
        )
      }
      if (successFiles.length > 0) {
        const successFileNames = successFiles.map((file) => file.processFile.name || file.processFile.id)
        toastSuccess(
          tx('actions.reprocessSuccess', {
            count: successFileNames.length,
            files: (
              <ul>
                {successFileNames.map((fileName) => (
                  <li key={fileName}>{fileName}</li>
                ))}
              </ul>
            ),
          }),
        )
      }
    },
  })
  const handleUploadComplete = async (uploadedFileIds: string[]) => {
    reprocessFilesMutate(uploadedFileIds)
  }

  const remainingStorage = availableStorage - usedStorage
  return (
    <nav className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <LoadingSpinner isLoading={reprocessFilesPending} />
      <div className="flex flex-wrap items-center gap-2">
        <DesktopFileUpload
          libraryId={libraryId}
          onUploadComplete={handleUploadComplete}
          disabled={remainingStorage < 1}
        />
        <GoogleFileUploadButton libraryId={libraryId} disabled={remainingStorage < 1} />

        <DropFilesDialog
          disabled={false}
          tableDataChanged={tableDataChanged}
          checkedFileIds={checkedFileIds}
          setCheckedFileIds={setCheckedFileIds}
        />

        <DropAllFilesDialog
          libraryId={libraryId}
          disabled={false}
          setCheckedFileIds={setCheckedFileIds}
          tableDataChanged={tableDataChanged}
          totalItems={totalItems}
        />

        <button
          type="button"
          className="btn btn-primary btn-xs"
          onClick={() => reprocessFilesMutate(checkedFileIds)}
          disabled={checkedFileIds.length === 0}
        >
          {t('actions.reprocess')}
        </button>

        <ProcessUnprocessedDialog
          libraryId={libraryId}
          unprocessedFileIds={[]}
          tableDataChanged={tableDataChanged}
          setCheckedFileIds={setCheckedFileIds}
          unprocessedFileCount={unprocessedFileCount}
        />
      </div>
      <div className="text-right text-sm">
        <div className="font-semibold">{t('labels.remainingStorage')}</div>
        <div>
          {availableStorage - usedStorage} / {usedStorage} MB
        </div>
      </div>
    </nav>
  )
}

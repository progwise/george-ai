import { useMutation } from '@tanstack/react-query'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { toastError, toastSuccess } from '../../georgeToaster'
import { reprocessFiles } from './change-files'
import { DesktopFileUpload } from './desktop-file-upload'
import { DropFilesDialog } from './drop-files-dialog'
import { GoogleFileUploadButton } from './google-file-upload'

interface FilesActionsBarProps {
  libraryId: string
  usedStorage: number
  availableStorage: number
  tableDataChanged: () => void
  checkedFileIds: string[]
  setCheckedFileIds: (fileIds: string[]) => void
}

export const FilesActionsBar = ({
  libraryId,
  usedStorage,
  availableStorage,
  tableDataChanged,
  checkedFileIds,
  setCheckedFileIds,
}: FilesActionsBarProps) => {
  const { t } = useTranslation()

  const reprocessFilesMutation = useMutation({
    mutationFn: async (fileIds: string[]) => reprocessFiles({ data: fileIds }),
    onSettled: () => {
      setCheckedFileIds([])
      tableDataChanged()
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : t('errors.reprocessFilesError')
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
          t('errors.reprocessFilesError', { count: errorFileNames.length, files: errorFileNames.join(', \n') }),
        )
      }
      if (successFiles.length > 0) {
        const successFileNames = successFiles.map((file) => file.processFile.name || file.processFile.id)
        toastSuccess(
          t('actions.reprocessSuccess', { count: successFileNames.length, files: successFileNames.join(', \n') }),
        )
      }
    },
  })
  const handleUploadComplete = async (uploadedFileIds: string[]) => {
    reprocessFilesMutation.mutate(uploadedFileIds)
  }

  const remainingStorage = availableStorage - usedStorage
  return (
    <nav className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

        <button
          type="button"
          className="btn btn-primary btn-xs"
          onClick={() => reprocessFilesMutation.mutate(checkedFileIds)}
          disabled={checkedFileIds.length === 0}
        >
          {t('actions.reprocess')}
        </button>
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

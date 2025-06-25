import { useMutation } from '@tanstack/react-query'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { toastError, toastSuccess } from '../../georgeToaster'
import { reProcessFiles } from './change-files'
import { DesktopFileUpload } from './desktop-file-upload'
import { DropFilesDialog } from './drop-files-dialog'
import { GoogleFileUploadButton } from './google-file-upload'

interface FilesActionsBarProps {
  libraryId: string
  usedStorage: number
  availableStorage: number
  tableDataChanged: () => void
  selectedFileIds: string[]
  setSelectedFileIds: (fileIds: string[]) => void
  checkedFileIds: string[]
  setCheckedFileIds: (fileIds: string[]) => void
}

export const FilesActionsBar = ({
  libraryId,
  usedStorage,
  availableStorage,
  tableDataChanged,
  selectedFileIds,
  setSelectedFileIds,
}: FilesActionsBarProps) => {
  const { t } = useTranslation()

  const reProcessFilesMutation = useMutation({
    mutationFn: async (fileIds: string[]) => {
      await reProcessFiles({ data: fileIds })
    },
    onSettled: () => {
      setSelectedFileIds([])
      tableDataChanged()
    },
    onError: () => {
      toastError(t('errors.reProcessFilesError'))
    },
    onSuccess: () => {
      toastSuccess(`${selectedFileIds.length} ${t('actions.reProcessSuccess')}`)
    },
  })
  const handleUploadComplete = async (uploadedFileIds: string[]) => {
    reProcessFilesMutation.mutate(uploadedFileIds)
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
          checkedFileIds={selectedFileIds}
          setCheckedFileIds={setSelectedFileIds}
        />

        <button
          type="button"
          className="btn btn-primary btn-xs"
          onClick={() => reProcessFilesMutation.mutate(selectedFileIds)}
          disabled={selectedFileIds.length === 0}
        >
          {t('actions.reProcess')}
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

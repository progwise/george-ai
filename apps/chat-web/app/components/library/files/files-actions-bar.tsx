import { useMutation } from '@tanstack/react-query'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { toastError, toastSuccess } from '../../georgeToaster'
import { reprocessFiles } from './change-files'
import { DesktopFileUpload } from './desktop-file-upload'
import { DropAllFilesDialog } from './drop-all-files-dialog'
import { DropFilesDialog } from './drop-files-dialog'
import { GoogleFileUploadButton } from './google-file-upload'

interface FilesActionsBarProps {
  libraryId: string
  usedStorage: number
  availableStorage: number
  tableDataChanged: () => void
  checkedFileIds: string[]
  setCheckedFileIds: (fileIds: string[]) => void
  allFileIds: string[]
}

export const FilesActionsBar = ({
  libraryId,
  usedStorage,
  availableStorage,
  tableDataChanged,
  checkedFileIds,
  setCheckedFileIds,
  allFileIds,
}: FilesActionsBarProps) => {
  const { t } = useTranslation()

  const reprocessFilesMutation = useMutation({
    mutationFn: async (fileIds: string[]) => {
      await reprocessFiles({ data: fileIds })
    },
    onSettled: () => {
      setCheckedFileIds([])
      tableDataChanged()
    },
    onError: () => {
      toastError(t('errors.reprocessFileError'))
    },
    onSuccess: () => {
      toastSuccess(`${checkedFileIds.length} ${t('actions.reprocessSuccess')}`)
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

        <DropAllFilesDialog
          disabled={false}
          setCheckedFileIds={setCheckedFileIds}
          tableDataChanged={tableDataChanged}
          allFileIds={allFileIds}
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

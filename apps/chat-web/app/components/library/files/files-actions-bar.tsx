import { useMutation } from '@tanstack/react-query'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { toastError, toastSuccess } from '../../georgeToaster'
import { dropFiles, reProcessFiles } from './change-files'
import { DesktopFileUpload } from './desktop-file-upload'
import { GoogleFileUploadButton } from './google-file-upload'

interface FilesActionsBarProps {
  libraryId: string
  usedStorage: number
  availableStorage: number
  refreshFiles: () => void
  selectedFiles: string[]
  setSelectedFiles: (fileIds: string[]) => void
}

export const FilesActionsBar = ({
  libraryId,
  usedStorage,
  availableStorage,
  refreshFiles,
  selectedFiles,
  setSelectedFiles,
}: FilesActionsBarProps) => {
  const { t } = useTranslation()
  const dropFilesMutation = useMutation({
    mutationFn: async (fileIds: string[]) => {
      await dropFiles({ data: fileIds })
    },
    onError: () => {
      toastError('An error occurred while dropping the files. Please try again later.')
    },
    onSuccess: () => {
      toastSuccess(`${selectedFiles.length} files dropped successfully.`)
    },
    onSettled: () => {
      setSelectedFiles([])
      refreshFiles()
    },
  })

  const reProcessFilesMutation = useMutation({
    mutationFn: async (fileIds: string[]) => {
      await reProcessFiles({ data: fileIds })
    },
    onSettled: () => {
      setSelectedFiles([])
      refreshFiles()
    },
    onError: () => {
      toastError('An error occurred while reprocessing the files. Please try again later.')
    },
    onSuccess: () => {
      toastSuccess(`${selectedFiles.length} files reprocessed successfully.`)
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

        <button
          type="button"
          className="btn btn-primary btn-xs"
          onClick={() => dropFilesMutation.mutate(selectedFiles)}
          disabled={selectedFiles.length === 0}
        >
          {t('actions.drop')}
        </button>
        <button
          type="button"
          className="btn btn-primary btn-xs"
          onClick={() => reProcessFilesMutation.mutate(selectedFiles)}
          disabled={selectedFiles.length === 0}
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

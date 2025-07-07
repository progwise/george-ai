import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useRef } from 'react'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { DialogForm } from '../../dialog-form'
import { toastError, toastSuccess } from '../../georgeToaster'
import { LoadingSpinner } from '../../loading-spinner'
import { clearEmbeddedFiles, deleteAiLibraryUpdate } from './change-files'
import { aiLibraryAllFilesQueryOptions } from './get-files'

interface DropAllFilesDialogProps {
  libraryId: string
  disabled: boolean
  tableDataChanged: () => void
  setCheckedFileIds: (fileIds: string[]) => void
  allFileIds: string[]
}

export const DropAllFilesDialog = ({ libraryId, setCheckedFileIds, tableDataChanged }: DropAllFilesDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { t } = useTranslation()

  const { isPending, ...dropVectorStore } = useMutation({
    mutationFn: async (fileIds: string[]) => {
      await clearEmbeddedFiles({ data: fileIds })
      await deleteAiLibraryUpdate({ data: libraryId })
    },
    onError: () => {
      toastError(t('errors.dropFilesError'))
    },
    onSuccess: () => {
      toastSuccess(t('actions.dropSuccess', { count: allFileIds.length }))
    },
    onSettled: () => {
      setCheckedFileIds([])
      tableDataChanged()
      dialogRef.current?.close()
    },
  })

  const textOfDropButton = t('actions.dropAll')

  const {
    data: { aiLibraryAllFiles },
  } = useSuspenseQuery(aiLibraryAllFilesQueryOptions({ libraryId }))
  const allFileIds = aiLibraryAllFiles.files.map((file) => file.id)

  return (
    <>
      <button
        type="button"
        className="btn btn-xs btn-primary tooltip tooltip-bottom"
        data-tip={t('tooltips.dropAllDescription')}
        onClick={() => dialogRef.current?.showModal()}
        disabled={allFileIds.length === 0}
      >
        {textOfDropButton}
      </button>

      <DialogForm
        ref={dialogRef}
        title={t('libraries.dropAllFilesDialog')}
        description={t('texts.dropAllFilesDialogDescription')}
        onSubmit={() => {
          dropVectorStore.mutate([libraryId])
        }}
        submitButtonText={textOfDropButton}
      >
        <LoadingSpinner isLoading={isPending} />

        <div className="w-full">
          <div className="mb-4">
            <>
              <span className="font-medium">{t('texts.numberOfFilesToBeDropped', { count: allFileIds.length })}</span>
            </>
          </div>
        </div>
      </DialogForm>
    </>
  )
}

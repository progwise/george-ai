import { useMutation } from '@tanstack/react-query'
import { useRef } from 'react'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { DialogForm } from '../../dialog-form'
import { toastError, toastSuccess } from '../../georgeToaster'
import { LoadingSpinner } from '../../loading-spinner'
import { dropAllFiles } from './change-files'

interface DropAllFilesDialogProps {
  libraryId: string
  disabled: boolean
  tableDataChanged: () => void
  setCheckedFileIds: (fileIds: string[]) => void
  totalItems: number
}

export const DropAllFilesDialog = ({
  libraryId,
  setCheckedFileIds,
  tableDataChanged,
  totalItems,
}: DropAllFilesDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { t } = useTranslation()

  const { isPending, mutate } = useMutation({
    mutationFn: async (libraryId: string) => {
      dialogRef.current?.close()
      await dropAllFiles({ data: [libraryId] })
    },
    onError: () => {
      toastError(t('errors.dropAllFilesError'))
    },
    onSuccess: () => {
      toastSuccess(t('actions.dropSuccess', { count: totalItems }))
    },
    onSettled: () => {
      setCheckedFileIds([])
      tableDataChanged()
    },
  })

  const textOfDropButton = t('actions.dropAllFiles')

  return (
    <>
      <button
        type="button"
        className="btn btn-xs btn-primary tooltip tooltip-bottom"
        data-tip={t('tooltips.dropAllDescription')}
        onClick={() => dialogRef.current?.showModal()}
        disabled={totalItems === 0}
      >
        {textOfDropButton}
      </button>

      <LoadingSpinner isLoading={isPending} />

      <DialogForm
        ref={dialogRef}
        title={t('libraries.dropAllFilesDialog')}
        description={t('texts.dropAllFilesDialogDescription')}
        onSubmit={() => {
          mutate(libraryId)
        }}
        submitButtonText={textOfDropButton}
      >
        <div className="w-full">
          <div className="mb-4">
            <>
              <span className="font-medium">{t('texts.numberOfFilesToBeDropped', { count: totalItems })}</span>
            </>
          </div>
        </div>
      </DialogForm>
    </>
  )
}

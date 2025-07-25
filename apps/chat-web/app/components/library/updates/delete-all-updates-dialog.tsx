import { useMutation } from '@tanstack/react-query'
import { useRef } from 'react'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { DialogForm } from '../../dialog-form'
import { toastError, toastSuccess } from '../../georgeToaster'
import { LoadingSpinner } from '../../loading-spinner'
import { deleteAllUpdates } from './change-updates'

interface DeleteAllUpdatesDialogProps {
  libraryId: string
  tableDataChanged: () => void
  totalItems: number
}

export const DeleteAllUpdatesDialog = ({ libraryId, tableDataChanged, totalItems }: DeleteAllUpdatesDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { t } = useTranslation()

  const { mutate, isPending } = useMutation({
    mutationFn: async (libraryId: string) => {
      dialogRef.current?.close()
      await deleteAllUpdates({ data: libraryId })
    },
    onSuccess: () => {
      toastSuccess(t('libraries.deleteAllUpdatesSuccess', { count: totalItems }))
    },
    onError: () => {
      toastError(t('libraries.deleteAllUpdatesFailed'))
    },
    onSettled: () => {
      tableDataChanged()
    },
  })

  return (
    <>
      <button
        type="button"
        className="btn btn-xs btn-primary tooltip tooltip-bottom"
        data-tip={t('tooltips.deleteAllUpdates')}
        onClick={() => dialogRef.current?.showModal()}
        disabled={totalItems === 0}
      >
        {t('actions.clearAllUpdates')}
      </button>

      <LoadingSpinner isLoading={isPending} />

      <DialogForm
        ref={dialogRef}
        title={t('libraries.deleteAllUpdates')}
        description={t('libraries.deleteAllUpdatesDescription')}
        onSubmit={() => mutate(libraryId)}
        submitButtonText=""
      ></DialogForm>
    </>
  )
}

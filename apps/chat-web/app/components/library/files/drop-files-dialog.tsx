import { useMutation } from '@tanstack/react-query'
import { useRef } from 'react'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { DialogForm } from '../../dialog-form'
import { toastError, toastSuccess } from '../../georgeToaster'
import { LoadingSpinner } from '../../loading-spinner'
import { dropFiles } from './change-files'

interface DropFilesDialogProps {
  disabled: boolean
  tableDataChanged: () => void
  checkedFileIds: string[]
  setCheckedFileIds: (fileIds: string[]) => void
}

export const DropFilesDialog = ({ checkedFileIds, setCheckedFileIds, tableDataChanged }: DropFilesDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { t } = useTranslation()

  const { isPending, ...dropFilesMutation } = useMutation({
    mutationFn: async (fileIds: string[]) => {
      await dropFiles({ data: fileIds })
    },
    onSuccess: () => {
      toastSuccess(t('actions.dropSuccess', { count: checkedFileIds.length }))
    },
    onError: () => {
      toastError(t('errors.dropFilesError'))
    },
    onSettled: () => {
      setCheckedFileIds([])
      tableDataChanged()
      dialogRef.current?.close()
    },
  })

  const textOfDropButton = t('actions.drop')

  return (
    <>
      <button
        type="button"
        className="btn btn-primary btn-xs tooltip tooltip-bottom"
        data-tip={t('tooltips.dropDescription')}
        onClick={() => dialogRef.current?.showModal()}
        disabled={checkedFileIds.length === 0}
      >
        {textOfDropButton}
      </button>

      <LoadingSpinner isLoading={isPending} />

      <DialogForm
        ref={dialogRef}
        title={t('libraries.dropFilesDialog')}
        description={t('texts.dropFilesDialogDescription')}
        onSubmit={() => dropFilesMutation.mutate(checkedFileIds)}
        submitButtonText={textOfDropButton}
      >
        <div className="w-full">
          <div className="mb-4">
            <span className="font-medium">{t('texts.numberOfFilesToBeDropped', { count: checkedFileIds.length })}</span>
          </div>
        </div>
      </DialogForm>
    </>
  )
}

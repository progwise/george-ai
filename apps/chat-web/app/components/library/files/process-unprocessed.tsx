import { useMutation } from '@tanstack/react-query'
import { useRef } from 'react'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { DialogForm } from '../../dialog-form'
import { toastError, toastSuccess } from '../../georgeToaster'
import { LoadingSpinner } from '../../loading-spinner'
import { processUnprocessedFiles } from './change-files'

interface ProcessUnprocessedDialogProps {
  libraryId: string
  disabled: boolean
  tableDataChanged: () => void
  unprocessedFileIds: string[]
  setCheckedFileIds: (fileIds: string[]) => void
  unprocessedFileCount: number
}

export const ProcessUnprocessedDialog = ({
  libraryId,
  setCheckedFileIds,
  tableDataChanged,
  unprocessedFileCount,
}: ProcessUnprocessedDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { t } = useTranslation()

  const { isPending, ...processUnprocessedMutation } = useMutation({
    mutationFn: async (libraryId: string[]) => {
      dialogRef.current?.close()
      await processUnprocessedFiles({ data: libraryId })
    },
    onSuccess: () => {
      toastSuccess(t('actions.processSuccess', { count: unprocessedFileCount ?? 0 }))
    },
    onError: () => {
      toastError(t('errors.processUnprocessed'))
    },
    onSettled: () => {
      setCheckedFileIds([])
      tableDataChanged()
    },
  })

  const textOfDropButton = t('actions.processUnprocessed')

  return (
    <>
      <button
        type="button"
        className="btn btn-primary btn-xs tooltip tooltip-bottom"
        data-tip={t('tooltips.processUnprocessed')}
        onClick={() => {
          tableDataChanged()
          dialogRef.current?.showModal()
        }}
      >
        {textOfDropButton}
      </button>

      <LoadingSpinner isLoading={isPending} />

      <DialogForm
        ref={dialogRef}
        title={t('libraries.processUnprocessed')}
        description={unprocessedFileCount === 0 ? t('texts.noUnprocessedFiles') : t('texts.processUnprocessed')}
        onSubmit={() => processUnprocessedMutation.mutate([libraryId])}
        submitButtonText={textOfDropButton}
        disabledSubmit={unprocessedFileCount === 0}
      >
        <div className="w-full">
          <div className="mb-4">
            <span className="font-medium">
              {unprocessedFileCount === 0 ? '' : t('texts.numberOfFilesToBeProcessed', { count: unprocessedFileCount })}
            </span>
          </div>
        </div>
      </DialogForm>
    </>
  )
}

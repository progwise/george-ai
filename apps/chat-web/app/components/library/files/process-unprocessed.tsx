import { useMutation } from '@tanstack/react-query'
import { useRef } from 'react'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { DialogForm } from '../../dialog-form'
import { toastError, toastSuccess, toastWarning } from '../../georgeToaster'
import { LoadingSpinner } from '../../loading-spinner'
import { processUnprocessedFiles } from './change-files'

interface ProcessUnprocessedDialogProps {
  libraryId: string
  tableDataChanged: () => void
  setCheckedFileIds: (fileIds: string[]) => void
  unprocessedFilesCount: number
  unprocessedFilesInQueueCount: number
}

export const ProcessUnprocessedDialog = ({
  libraryId,
  setCheckedFileIds,
  tableDataChanged,
  unprocessedFilesCount,
  unprocessedFilesInQueueCount,
}: ProcessUnprocessedDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { t } = useTranslation()

  const { isPending, mutate } = useMutation({
    mutationFn: async (libraryId: string[]) => {
      dialogRef.current?.close()
      const results = await processUnprocessedFiles({ data: libraryId })

      // extract totalProcessedCount and successfulCount from processUnprocessedFiles
      const totalProcessedCount = results[0]?.totalProcessedCount ?? 0
      const successfulCount = results[0]?.successfulCount ?? 0

      return { totalProcessedCount, successfulCount }
    },
    onSuccess: ({ totalProcessedCount, successfulCount }) => {
      // success, but not all processed successfully
      if (totalProcessedCount > successfulCount) {
        toastWarning(t('actions.processSuccess', { count: totalProcessedCount }))
        toastError(t('errors.reprocessFiles', { count: totalProcessedCount - successfulCount }))
      }
      // no new files to process
      if (successfulCount === 0) {
        toastWarning(t('actions.noNewFilesToProcess'))
      } else {
        toastSuccess(t('actions.processSuccess', { count: totalProcessedCount }))
      }
    },
    onError: () => {
      toastError(t('errors.processUnprocessed'))
    },
    onSettled: () => {
      setCheckedFileIds([])
      tableDataChanged()
    },
  })

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
        {t('actions.processUnprocessed')}
      </button>

      <LoadingSpinner isLoading={isPending} />

      <DialogForm
        ref={dialogRef}
        title={t('libraries.processUnprocessed')}
        description={unprocessedFilesCount === 0 ? t('texts.noUnprocessedFiles') : t('texts.processUnprocessed')}
        onSubmit={() => mutate([libraryId])}
        disabledSubmit={unprocessedFilesCount === 0}
      >
        <div className="w-full">
          <div className="mb-4 font-medium">
            <p>
              {unprocessedFilesCount === 0
                ? ''
                : t('texts.numberOfFilesToBeProcessed', { count: unprocessedFilesCount })}
            </p>
            <p>
              {unprocessedFilesInQueueCount === 0
                ? ''
                : t('texts.numberOfFilesInQueue', { count: unprocessedFilesInQueueCount })}
            </p>
          </div>
        </div>
      </DialogForm>
    </>
  )
}

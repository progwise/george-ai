import { useMutation } from '@tanstack/react-query'
import { useRef } from 'react'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { DialogForm } from '../../dialog-form'
import { toastError, toastSuccess } from '../../georgeToaster'
import { LoadingSpinner } from '../../loading-spinner'
import { dropFiles } from './change-files'

interface DropAllFilesDialogProps {
  disabled: boolean
  tableDataChanged: () => void
  setCheckedFileIds: (fileIds: string[]) => void
  allFileIds: string[]
}

export const DropAllFilesDialog = ({ setCheckedFileIds, tableDataChanged, allFileIds }: DropAllFilesDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { t } = useTranslation()

  const { isPending, ...dropAllFilesMutation } = useMutation({
    mutationFn: async (fileIds: string[]) => {
      await dropFiles({ data: fileIds })
    },
    onError: () => {
      toastError(t('errors.dropFilesError'))
    },
    onSuccess: () => {
      toastSuccess(t('actions.dropSuccess', { count: allFileIds.length }))
    },
    onSettled: () => {
      dialogRef.current?.close()
      setCheckedFileIds([])
      tableDataChanged()
    },
  })

  tableDataChanged()

  const textOfDropButton = t('actions.dropAll')

  // // check log
  // console.log(allFileIds.length)

  // const {
  //   data: { aiLibraryAllFiles },
  // } = useSuspenseQuery(aiLibraryAllFilesQueryOptions({ libraryId }))

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

      <LoadingSpinner isLoading={isPending} />

      <DialogForm
        ref={dialogRef}
        title={t('libraries.dropAllFilesDialog')}
        description={t('texts.dropAllFilesDialogDescription')}
        onSubmit={() => dropAllFilesMutation.mutate(allFileIds)}
        submitButtonText={textOfDropButton}
      >
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

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useRef } from 'react'

import { AiLibraryBaseFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { ExitIcon } from '../../../icons/exit-icon'
import { leaveLibrary } from '../../../server-functions/library-users'
import { DialogForm } from '../../dialog-form'
import { getLibrariesQueryOptions } from '../get-libraries'

interface LibraryLeaveDialogProps {
  library: AiLibraryBaseFragment
}

export const LibraryLeaveDialog = ({ library }: LibraryLeaveDialogProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const dialogRef = useRef<HTMLDialogElement>(null)

  const { mutate: leaveLibraryMutate, isPending } = useMutation({
    mutationFn: async () => {
      return await leaveLibrary({
        data: {
          libraryId: library.id,
        },
      })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries(getLibrariesQueryOptions())
      navigate({ to: '..' })
    },
  })

  return (
    <>
      <button
        type="button"
        className="btn btn-ghost btn-sm lg:tooltip lg:tooltip-bottom"
        onClick={() => {
          dialogRef.current?.showModal()
        }}
        data-tip={t('libraries.leave')}
      >
        <ExitIcon className="size-6" />
      </button>

      <DialogForm
        ref={dialogRef}
        title={t('libraries.leave')}
        description={t('libraries.leaveConfirmation')}
        onSubmit={() => {
          leaveLibraryMutate()
        }}
        submitButtonText={t('actions.leave')}
        disabledSubmit={isPending}
      />
    </>
  )
}

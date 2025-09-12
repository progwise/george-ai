import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useRef } from 'react'

import { graphql } from '../../../gql'
import { LibraryLeaveDialog_LibraryFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { ExitIcon } from '../../../icons/exit-icon'
import { leaveLibraryParticipant } from '../../../server-functions/library-participations'
import { DialogForm } from '../../dialog-form'
import { getLibrariesQueryOptions } from '../get-libraries'

graphql(`
  fragment LibraryLeaveDialog_Library on AiLibrary {
    id
    name
    filesCount
  }
`)

interface LibraryLeaveDialogProps {
  library: LibraryLeaveDialog_LibraryFragment
}

export const LibraryLeaveDialog = ({ library }: LibraryLeaveDialogProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const dialogRef = useRef<HTMLDialogElement>(null)

  const { mutate: leaveLibraryMutate, isPending } = useMutation({
    mutationFn: async () => {
      return await leaveLibraryParticipant({
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

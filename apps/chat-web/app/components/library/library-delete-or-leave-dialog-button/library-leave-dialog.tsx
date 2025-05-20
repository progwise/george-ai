import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useRef } from 'react'

import { FragmentType, graphql, useFragment } from '../../../gql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { ExitIcon } from '../../../icons/exit-icon'
import { leaveLibraryParticipant } from '../../../server-functions/library-participations'
import { DialogForm } from '../../dialog-form'
import { getLibrariesQueryOptions } from '../get-libraries-query-options'

const LibraryLeaveDialog_LibraryFragment = graphql(`
  fragment LibraryLeaveDialog_Library on AiLibrary {
    id
  }
`)

interface LibraryLeaveDialogProps {
  library: FragmentType<typeof LibraryLeaveDialog_LibraryFragment>
  userId: string
}

export const LibraryLeaveDialog = (props: LibraryLeaveDialogProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const dialogRef = useRef<HTMLDialogElement>(null)

  const library = useFragment(LibraryLeaveDialog_LibraryFragment, props.library)

  const { mutate: leaveLibraryMutate, isPending } = useMutation({
    mutationFn: async () => {
      return await leaveLibraryParticipant({
        data: {
          userId: props.userId,
          libraryId: library.id,
        },
      })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries(getLibrariesQueryOptions(props.userId))
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

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { twMerge } from 'tailwind-merge'

import { FragmentType, graphql, useFragment } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { CrossIcon } from '../../icons/cross-icon'
import { removeLibraryParticipant } from '../../server-functions/library-participations'
import { User } from '../../server-functions/users'
import { LoadingSpinner } from '../loading-spinner'
import { getLibrariesQueryOptions } from './get-libraries-query-options'
import { getLibraryQueryOptions } from './get-library-query-options'
import { LibraryParticipantsDialogButton } from './library-participants-dialog-button'

const LibraryParticipants_LibraryFragment = graphql(`
  fragment LibraryParticipants_Library on AiLibrary {
    id
    ownerId
    participants {
      id
      name
      username
    }
    ...LibraryParticipantsDialogButton_Library
  }
`)

interface LibraryParticipantsProps {
  library: FragmentType<typeof LibraryParticipants_LibraryFragment>
  users: User[]
  userId: string
}

export const LibraryParticipants = (props: LibraryParticipantsProps) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const library = useFragment(LibraryParticipants_LibraryFragment, props.library)
  const { users } = props

  const isOwner = library.ownerId === props.userId

  const { mutate: mutateRemove, isPending: removeParticipantIsPending } = useMutation({
    mutationFn: async ({ libraryId, participantId }: { libraryId: string; participantId: string }) => {
      return await removeLibraryParticipant({ data: { libraryId, participantId } })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries(getLibraryQueryOptions(library.id))
      await queryClient.invalidateQueries(getLibrariesQueryOptions())
    },
  })

  const handleRemoveParticipant = (event: React.MouseEvent<HTMLButtonElement>, userId: string) => {
    event.preventDefault()
    mutateRemove({ participantId: userId, libraryId: library.id })
  }

  return (
    <div className="flex w-full items-center justify-between gap-2 overflow-auto">
      <LoadingSpinner isLoading={removeParticipantIsPending} />
      <div className="no-scrollbar flex gap-2 overflow-x-scroll p-1">
        {library.participants.map((participant) => {
          const isParticipantOwner = participant.id === library.ownerId
          return (
            <div
              key={participant.id}
              className={twMerge(
                'badge badge-lg text-nowrap text-xs',
                isParticipantOwner ? 'badge-accent' : 'badge-primary',
              )}
            >
              {participant.id !== props.userId && isOwner && (
                <button
                  type="button"
                  className="btn btn-circle btn-ghost btn-xs"
                  onClick={(event) => handleRemoveParticipant(event, participant.id)}
                >
                  <CrossIcon />
                </button>
              )}
              <span className="max-w-36 truncate">{participant.name ?? participant.username}</span>
              {isParticipantOwner && <span className="pl-1 font-bold">({t('libraries.owner')})</span>}
            </div>
          )
        })}
      </div>
      {isOwner && <LibraryParticipantsDialogButton library={library} users={users} />}
    </div>
  )
}

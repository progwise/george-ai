import { twMerge } from 'tailwind-merge'
import { AiAssistant, AiConversationParticipant, User } from '../../gql/graphql'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  addConversationParticipants,
  removeConversationParticipant,
} from '../../server-functions/participations'
import { LoadingSpinner } from '../loading-spinner'
import { useRef } from 'react'
import { myConversationsQueryOptions } from '../../server-functions/conversations'
import { useAuth } from '../../auth/auth-context'
import { PlusIcon } from '../../icons/plus-icon'
import { CrossIcon } from '../../icons/cross-icon'

interface ConversationParticipantsProps {
  conversationId: string
  participants?: AiConversationParticipant[] | null
  assistants?: AiAssistant[] | null
  users?: User[] | null
}

export const ConversationParticipants = ({
  conversationId,
  participants,
  assistants,
  users,
}: ConversationParticipantsProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const auth = useAuth()
  const queryClient = useQueryClient()
  const { mutate: mutateRemove, isPending: removeParticipantIsPending } =
    useMutation({
      mutationFn: async ({ participantId }: { participantId: string }) => {
        return await removeConversationParticipant({ data: { participantId } })
      },
      onSettled: async () => {
        await queryClient.invalidateQueries(
          myConversationsQueryOptions(auth.user?.id),
        )
      },
    })

  const { mutate: mutateAdd, isPending: addParticipantIsPending } = useMutation(
    {
      mutationFn: async ({
        assistantIds,
        userIds,
      }: {
        assistantIds: string[]
        userIds: string[]
      }) => {
        return await addConversationParticipants({
          data: { conversationId, assistantIds, userIds },
        })
      },
      onSettled: async () => {
        await queryClient.invalidateQueries(
          myConversationsQueryOptions(auth.user?.id),
        )
        dialogRef.current?.close()
      },
    },
  )

  const handleRemoveParticipant = (
    event: React.MouseEvent<HTMLButtonElement>,
    { participant }: { participant: AiConversationParticipant },
  ) => {
    event.preventDefault()
    mutateRemove({ participantId: participant.id })
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    const assistantIds = formData
      .getAll('assistants')
      .map((id) => id.toString())
    const userIds = formData.getAll('users').map((id) => id.toString())

    mutateAdd({ assistantIds, userIds })
  }
  return (
    <div className="flex gap-2 items-center flex-wrap">
      <LoadingSpinner
        isLoading={removeParticipantIsPending || addParticipantIsPending}
      />
      <dialog className="modal" ref={dialogRef}>
        <div className="modal-box">
          <form method="dialog" onSubmit={handleSubmit}>
            <div className="flex flex-row gap-2">
              <div>
                {assistants?.map((assistant) => (
                  <label
                    key={assistant.id}
                    className="cursor-pointer label gap-2"
                  >
                    <input
                      type="checkbox"
                      name="assistants"
                      value={assistant.id}
                      defaultChecked
                      className="checkbox checkbox-info"
                    />
                    <span className="label-text">{assistant.name}</span>
                  </label>
                ))}
              </div>
              <div>
                {users?.map((user) => (
                  <label key={user.id} className="cursor-pointer label gap-2">
                    <input
                      type="checkbox"
                      name="users"
                      value={user.id}
                      defaultChecked
                      className="checkbox checkbox-info"
                    />
                    <span className="label-text">{user.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="modal-action">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={addParticipantIsPending || !assistants}
              >
                Create
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => dialogRef.current?.close()}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </dialog>
      {participants?.map((participant) => (
        <div
          key={participant.id}
          className={twMerge(
            'badge badge-lg text-nowrap text-xs',
            participant.assistantId && 'badge-secondary',
            participant.userId && 'badge-primary',
          )}
        >
          <button
            type="button"
            className="btn btn-ghost btn-xs btn-circle"
            onClick={(event) => handleRemoveParticipant(event, { participant })}
          >
            <CrossIcon />
          </button>
          {participant.name}
        </div>
      ))}
      <button
        type="button"
        className="btn btn-xs btn-neutral flex flex-row "
        onClick={() => dialogRef.current?.showModal()}
      >
        <PlusIcon />
        Add...
      </button>
    </div>
  )
}

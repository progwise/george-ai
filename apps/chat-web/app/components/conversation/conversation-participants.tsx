import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef } from 'react'
import { twMerge } from 'tailwind-merge'

import { useAuth } from '../../auth/auth-hook'
import { FragmentType, graphql, useFragment } from '../../gql'
import { CrossIcon } from '../../icons/cross-icon'
import { PlusIcon } from '../../icons/plus-icon'
import { queryKeys } from '../../query-keys'
import { addConversationParticipants, removeConversationParticipant } from '../../server-functions/participations'
import { LoadingSpinner } from '../loading-spinner'

const ConversationParticipants_ConversationFragment = graphql(`
  fragment ConversationParticipants_conversation on AiConversation {
    id
    ownerId
    participants {
      id
      name
      userId
      assistantId
    }
  }
`)

const ConversationParticipants_HumanParticipationCandidatesFragment = graphql(`
  fragment ConversationParticipants_HumanParticipationCandidates on User {
    id
    name
    username
  }
`)

const ConversationParticipants_AssistantParticipationCandidatesFragment = graphql(`
  fragment ConversationParticipants_AssistantParticipationCandidates on AiAssistant {
    id
    name
  }
`)

interface ConversationParticipantsProps {
  conversation: FragmentType<typeof ConversationParticipants_ConversationFragment>
  assistantCandidates: FragmentType<typeof ConversationParticipants_AssistantParticipationCandidatesFragment>[] | null
  humanCandidates: FragmentType<typeof ConversationParticipants_HumanParticipationCandidatesFragment>[] | null
}

export const ConversationParticipants = (props: ConversationParticipantsProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const queryClient = useQueryClient()
  const auth = useAuth()
  const conversation = useFragment(ConversationParticipants_ConversationFragment, props.conversation)

  const humanCandidates = useFragment(
    ConversationParticipants_HumanParticipationCandidatesFragment,
    props.humanCandidates,
  )
  const assistantCandidates = useFragment(
    ConversationParticipants_AssistantParticipationCandidatesFragment,
    props.assistantCandidates,
  )

  const existingAssistantIds = conversation.participants.filter((p) => p.assistantId).map((p) => p.assistantId)

  const existingUserIds = conversation.participants.filter((p) => p.userId).map((p) => p.userId)

  const filteredAssistantCandidates = assistantCandidates?.filter(
    (assistant) => !existingAssistantIds.includes(assistant.id),
  )

  const filteredHumanCandidates = humanCandidates?.filter((human) => !existingUserIds.includes(human.id))

  const isOwner = auth.user?.id === conversation.ownerId

  const { mutate: mutateRemove, isPending: removeParticipantIsPending } = useMutation({
    mutationFn: async ({ participantId }: { participantId: string }) => {
      if (!isOwner) {
        throw new Error('Only the owner can remove participants')
      }
      return await removeConversationParticipant({ data: { participantId } })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: [queryKeys.Conversation, conversation.id],
      })
    },
  })

  const { mutate: mutateAdd, isPending: addParticipantIsPending } = useMutation({
    mutationFn: async ({ assistantIds, userIds }: { assistantIds: string[]; userIds: string[] }) => {
      if (!isOwner) {
        throw new Error('Only the owner can add participants')
      }
      if (!auth.user?.id) {
        throw new Error('User not set')
      }
      return await addConversationParticipants({
        data: { conversationId: conversation.id, assistantIds, userIds, ownerId: auth.user.id },
      })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: [queryKeys.Conversation, conversation.id],
      })
      await queryClient.invalidateQueries({
        queryKey: [queryKeys.Conversations, auth.user?.id],
      })

      dialogRef.current?.close()
    },
  })

  const handleRemoveParticipant = (event: React.MouseEvent<HTMLButtonElement>, participantId: string) => {
    if (!isOwner) {
      console.error('Only the conversation owner can remove participants')
      return
    }
    event.preventDefault()
    mutateRemove({ participantId })
  }

  const handleSubmit = () => {
    if (!isOwner) {
      console.error('Only the conversation owner can add participants')
      return
    }
    const form = document.getElementById('participants-form') as HTMLFormElement
    if (form) {
      const formData = new FormData(form)
      const assistantIds = formData.getAll('assistants').map((id) => id.toString())
      const userIds = formData.getAll('users').map((id) => id.toString())

      mutateAdd({ assistantIds, userIds })
    }
  }

  if (auth.user == null || !auth.user?.id) {
    return <></>
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <LoadingSpinner isLoading={removeParticipantIsPending || addParticipantIsPending} />
      <dialog className="modal" ref={dialogRef}>
        <div className="modal-box">
          <h3 className="text-lg font-bold">Add participants</h3>
          <p className="py-4">You can add participants to the current conversation.</p>
          <form id="participants-form">
            <div className="flex flex-row justify-items-stretch gap-2">
              <div>
                <h4 className="underline">Assistants</h4>
                {filteredAssistantCandidates?.map((assistant) => (
                  <label key={assistant.id} className="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      name="assistants"
                      value={assistant.id}
                      defaultChecked
                      className="checkbox-info checkbox"
                    />
                    <span className="label-text">{assistant.name}</span>
                  </label>
                ))}
              </div>
              <div>
                <h4 className="underline">Users</h4>
                {filteredHumanCandidates?.map((user) => (
                  <label key={user.id} className="label cursor-pointer gap-2">
                    <input
                      type="checkbox"
                      name="users"
                      value={user.id}
                      defaultChecked
                      className="checkbox-info checkbox"
                    />
                    <span className="label-text">{user.name || user.username}</span>
                  </label>
                ))}
              </div>
            </div>
          </form>
          <div className="modal-action">
            <button type="button" className="btn btn-sm" onClick={() => dialogRef.current?.close()}>
              Cancel
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={addParticipantIsPending}
              onClick={handleSubmit}
            >
              Add
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button type="submit">close</button>
        </form>
      </dialog>
      {conversation.participants.map((participant) => (
        <div
          key={participant.id}
          className={twMerge(
            'badge badge-lg text-nowrap text-xs',
            participant.assistantId && 'badge-secondary',
            participant.userId && 'badge-primary',
          )}
        >
          {participant.userId !== auth.user?.id && isOwner && (
            <button
              type="button"
              className="btn btn-circle btn-ghost btn-xs"
              onClick={(event) => handleRemoveParticipant(event, participant.id)}
            >
              <CrossIcon />
            </button>
          )}
          {participant.name}
        </div>
      ))}
      {isOwner && (
        <button
          type="button"
          className="btn btn-neutral btn-xs flex flex-row"
          onClick={() => dialogRef.current?.showModal()}
        >
          <PlusIcon />
          Add...
        </button>
      )}
    </div>
  )
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef } from 'react'
import { twMerge } from 'tailwind-merge'

import { useAuth } from '../../auth/auth-hook'
import { FragmentType, graphql, useFragment } from '../../gql'
import { CrossIcon } from '../../icons/cross-icon'
import { PlusIcon } from '../../icons/plus-icon'
import { queryKeys } from '../../query-keys'
import {
  addConversationParticipants,
  removeConversationParticipant,
} from '../../server-functions/participations'
import { LoadingSpinner } from '../loading-spinner'

const ConversationParticipants_ConversationFragment = graphql(`
  fragment ConversationParticipants_conversation on AiConversation {
    id
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

const ConversationParticipants_AssistantParticipationCandidatesFragment =
  graphql(`
    fragment ConversationParticipants_AssistantParticipationCandidates on AiAssistant {
      id
      name
    }
  `)

interface ConversationParticipantsProps {
  conversation: FragmentType<
    typeof ConversationParticipants_ConversationFragment
  >
  assistantCandidates:
    | FragmentType<
        typeof ConversationParticipants_AssistantParticipationCandidatesFragment
      >[]
    | null
  humanCandidates:
    | FragmentType<
        typeof ConversationParticipants_HumanParticipationCandidatesFragment
      >[]
    | null
}

export const ConversationParticipants = (
  props: ConversationParticipantsProps,
) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const queryClient = useQueryClient()
  const auth = useAuth()
  const conversation = useFragment(
    ConversationParticipants_ConversationFragment,
    props.conversation,
  )

  const humanCandidates = useFragment(
    ConversationParticipants_HumanParticipationCandidatesFragment,
    props.humanCandidates,
  )
  const assistantCandidates = useFragment(
    ConversationParticipants_AssistantParticipationCandidatesFragment,
    props.assistantCandidates,
  )

  const { mutate: mutateRemove, isPending: removeParticipantIsPending } =
    useMutation({
      mutationFn: async ({ participantId }: { participantId: string }) => {
        return await removeConversationParticipant({ data: { participantId } })
      },
      onSettled: async () => {
        await queryClient.invalidateQueries({
          queryKey: [queryKeys.Conversation, conversation.id],
        })
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
          data: { conversationId: conversation.id, assistantIds, userIds },
        })
      },
      onSettled: async () => {
        await queryClient.invalidateQueries({
          queryKey: [queryKeys.Conversation, conversation.id],
        })
        dialogRef.current?.close()
      },
    },
  )

  const handleRemoveParticipant = (
    event: React.MouseEvent<HTMLButtonElement>,
    participantId: string,
  ) => {
    event.preventDefault()
    mutateRemove({ participantId })
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

  if (auth.user == null || !auth.user?.id) {
    return <></>
  }

  return (
    <div className="flex gap-2 items-center flex-wrap">
      <LoadingSpinner
        isLoading={removeParticipantIsPending || addParticipantIsPending}
      />
      <dialog className="modal" ref={dialogRef}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Add participants</h3>
          <p className="py-4">
            You can add participants to the current conversation.
          </p>
          <form method="dialog" onSubmit={handleSubmit}>
            <div className="flex flex-row gap-2">
              <div>
                <h4 className="underline">Assistants</h4>
                {assistantCandidates?.map((assistant) => (
                  <label
                    key={assistant.id}
                    className="cursor-pointer label gap-2 justify-start"
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
                <h4 className="underline">Users</h4>
                {humanCandidates?.map((user) => (
                  <label key={user.id} className="cursor-pointer label gap-2">
                    <input
                      type="checkbox"
                      name="users"
                      value={user.id}
                      defaultChecked
                      className="checkbox checkbox-info"
                    />
                    <span className="label-text">
                      {user.name || user.username}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div className="modal-action">
              <button
                type="button"
                className="btn"
                onClick={() => dialogRef.current?.close()}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={addParticipantIsPending}
              >
                Add
              </button>
            </div>
          </form>
        </div>
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
          {participant.userId !== auth.user?.id && (
            <button
              type="button"
              className="btn btn-ghost btn-xs btn-circle"
              onClick={(event) =>
                handleRemoveParticipant(event, participant.id)
              }
            >
              <CrossIcon />
            </button>
          )}
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

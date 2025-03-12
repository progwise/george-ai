import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef } from 'react'
import { twMerge } from 'tailwind-merge'

import { useAuth } from '../../auth/auth-hook'
import { FragmentType, graphql, useFragment } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { CrossIcon } from '../../icons/cross-icon'
import { PlusIcon } from '../../icons/plus-icon'
import { queryKeys } from '../../query-keys'
import { addConversationParticipants, removeConversationParticipant } from '../../server-functions/participations'
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
  const { t } = useTranslation()

  const conversation = useFragment(ConversationParticipants_ConversationFragment, props.conversation)

  const humanCandidates = useFragment(
    ConversationParticipants_HumanParticipationCandidatesFragment,
    props.humanCandidates,
  )
  const assistantCandidates = useFragment(
    ConversationParticipants_AssistantParticipationCandidatesFragment,
    props.assistantCandidates,
  )

  const { mutate: mutateRemove, isPending: removeParticipantIsPending } = useMutation({
    mutationFn: async ({ participantId }: { participantId: string }) => {
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
  })

  const handleRemoveParticipant = (event: React.MouseEvent<HTMLButtonElement>, participantId: string) => {
    event.preventDefault()
    mutateRemove({ participantId })
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    const assistantIds = formData.getAll('assistants').map((id) => id.toString())
    const userIds = formData.getAll('users').map((id) => id.toString())

    mutateAdd({ assistantIds, userIds })
  }

  if (auth.user == null || !auth.user?.id) {
    return <></>
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <LoadingSpinner isLoading={removeParticipantIsPending || addParticipantIsPending} />
      <dialog className="modal" ref={dialogRef}>
        <div className="modal-box">
          <h3 className="text-lg font-bold">{t('texts.addParticipants')}</h3>
          <p className="py-4">{t('texts.addParticipantsConfirmation')}</p>
          <form method="dialog" onSubmit={handleSubmit}>
            <div className="flex flex-row gap-2">
              <div className="w-1/2">
                <h4 className="underline">{t('assistants')}</h4>
                {assistantCandidates && assistantCandidates.length > 0 ? (
                  assistantCandidates.map((assistant) => (
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
                  ))
                ) : (
                  <p>{t('texts.noAssistantsAvailable')}</p>
                )}
              </div>
              <div className="w-1/2">
                <h4 className="underline">{t('users')}</h4>
                {humanCandidates && humanCandidates.length > 0 ? (
                  humanCandidates.map((user) => (
                    <label key={user.id} className="label cursor-pointer justify-start gap-2">
                      <input
                        type="checkbox"
                        name="users"
                        value={user.id}
                        defaultChecked
                        className="checkbox-info checkbox"
                      />
                      <span className="label-text">{user.name || user.username}</span>
                    </label>
                  ))
                ) : (
                  <p>{t('texts.noUsersAvailable')}</p>
                )}
              </div>
            </div>
            <div className="modal-action">
              <button type="button" className="btn btn-sm" onClick={() => dialogRef.current?.close()}>
                {t('actions.cancel')}
              </button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={addParticipantIsPending}>
                {t('actions.add')}
              </button>
            </div>
          </form>
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
          {participant.userId !== auth.user?.id && (
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
      <button type="button" className="btn btn-neutral btn-xs" onClick={() => dialogRef.current?.showModal()}>
        <PlusIcon />
        {t('actions.add')}...
      </button>
    </div>
  )
}

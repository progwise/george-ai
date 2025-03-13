/* eslint-disable @eslint-react/hooks-extra/no-direct-set-state-in-use-effect */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
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
  const [selectedAssistants, setSelectedAssistants] = useState<string[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

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

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'assistants' | 'users') => {
    const { value, checked } = event.target
    if (type === 'assistants') {
      setSelectedAssistants((prev) => (checked ? [...prev, value] : prev.filter((id) => id !== value)))
    } else {
      setSelectedUsers((prev) => (checked ? [...prev, value] : prev.filter((id) => id !== value)))
    }
  }

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

  useEffect(() => {
    const existingParticipantIds = conversation.participants.map((participant) => participant.id)

    if (assistantCandidates) {
      const filteredAssistants = assistantCandidates.filter(
        (assistant) => !existingParticipantIds.includes(assistant.id),
      )
      setSelectedAssistants(filteredAssistants.map((assistant) => assistant.id))
    }

    if (humanCandidates) {
      const filteredUsers = humanCandidates.filter((user) => !existingParticipantIds.includes(user.id))
      setSelectedUsers(filteredUsers.map((user) => user.id))
    }
  }, [assistantCandidates, humanCandidates, conversation.participants])

  const isAddButtonDisabled = addParticipantIsPending || (selectedAssistants.length === 0 && selectedUsers.length === 0)

  const existingParticipantIds = conversation.participants.map(
    (participant) => participant.userId || participant.assistantId,
  )

  const filteredAssistantCandidates = assistantCandidates?.filter(
    (assistant) => !existingParticipantIds.includes(assistant.id),
  )

  const filteredHumanCandidates = humanCandidates?.filter((user) => !existingParticipantIds.includes(user.id))

  if (auth.user == null || !auth.user?.id) {
    return <></>
  }

  return (
    <div className="flex flex-wrap gap-2">
      <LoadingSpinner isLoading={removeParticipantIsPending || addParticipantIsPending} />
      <dialog className="modal" ref={dialogRef}>
        <div className="modal-box">
          <h3 className="text-lg font-bold">{t('texts.addParticipants')}</h3>
          <p className="py-4">{t('texts.addParticipantsConfirmation')}</p>
          <form method="dialog" onSubmit={handleSubmit}>
            <div className="flex gap-2">
              <div className="w-1/2">
                <h4 className="underline">{t('assistants')}</h4>
                {filteredAssistantCandidates && filteredAssistantCandidates.length > 0 ? (
                  filteredAssistantCandidates.map((assistant) => (
                    <label key={assistant.id} className="label cursor-pointer justify-start gap-2">
                      <input
                        type="checkbox"
                        name="assistants"
                        value={assistant.id}
                        defaultChecked
                        className="checkbox-info checkbox"
                        onChange={(e) => handleCheckboxChange(e, 'assistants')}
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
                {filteredHumanCandidates && filteredHumanCandidates.length > 0 ? (
                  filteredHumanCandidates.map((user) => (
                    <label key={user.id} className="label cursor-pointer justify-start gap-2">
                      <input
                        type="checkbox"
                        name="users"
                        value={user.id}
                        defaultChecked
                        className="checkbox-info checkbox"
                        onChange={(e) => handleCheckboxChange(e, 'users')}
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

              <div
                className={` ${isAddButtonDisabled ? 'lg:tooltip lg:tooltip-left' : ''} `}
                data-tip={t('tooltips.addNoParticipantsSelected')}
              >
                <button type="submit" className="btn btn-primary btn-sm" disabled={isAddButtonDisabled}>
                  {t('actions.add')}
                </button>
              </div>
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

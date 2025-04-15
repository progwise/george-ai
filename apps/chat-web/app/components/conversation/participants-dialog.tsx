import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'

import { useAuth } from '../../auth/auth-hook'
import { FragmentType, graphql, useFragment } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { PlusIcon } from '../../icons/plus-icon'
import { queryKeys } from '../../query-keys'
import { createConversation } from '../../server-functions/conversations'
import { addConversationParticipants } from '../../server-functions/participations'
import { DialogForm } from '../dialog-form'
import { Input } from '../form/input'
import { LoadingSpinner } from '../loading-spinner'

const ParticipantsDialog_ConversationFragment = graphql(`
  fragment ParticipantsDialog_Conversation on AiConversation {
    id
    ownerId
    participants {
      id
      userId
      assistantId
    }
  }
`)

const ParticipantsDialog_AssistantFragment = graphql(`
  fragment ParticipantsDialog_Assistant on AiAssistant {
    id
    name
  }
`)

const ParticipantsDialog_HumanFragment = graphql(`
  fragment ParticipantsDialog_Human on User {
    id
    username
    email
    profile {
      business
      position
      firstName
      lastName
    }
  }
`)

interface ParticipantsDialogProps {
  conversation?: FragmentType<typeof ParticipantsDialog_ConversationFragment>
  assistants: FragmentType<typeof ParticipantsDialog_AssistantFragment>[]
  humans: FragmentType<typeof ParticipantsDialog_HumanFragment>[]
  dialogMode: 'new' | 'add'
  isOpen?: boolean
}

export const ParticipantsDialog = (props: ParticipantsDialogProps) => {
  const { t } = useTranslation()
  const [usersFilter, setUsersFilter] = useState<string | null>(null)
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [selectedAssistantIds, setSelectedAssistantIds] = useState<string[]>([])

  const dialogRef = useRef<HTMLDialogElement>(null)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const authContext = useAuth()
  const user = authContext.user

  const conversation = useFragment(ParticipantsDialog_ConversationFragment, props.conversation)
  const assistants = useFragment(ParticipantsDialog_AssistantFragment, props.assistants)
  const humans = useFragment(ParticipantsDialog_HumanFragment, props.humans)

  const assignedAssistantIds = useMemo(
    () =>
      (conversation?.participants
        .filter((participant) => participant.assistantId)
        .map((participant) => participant.assistantId) as string[]) || [],
    [conversation],
  )

  const availableAssistants = useMemo(
    () => assistants?.filter((assistant) => !assignedAssistantIds?.includes(assistant.id)) || [],
    [assistants, assignedAssistantIds],
  )

  const assignedUserIds = useMemo(
    () =>
      (conversation?.participants
        .filter((participant) => participant.userId)
        .map((participant) => participant.userId) as string[]) || [],
    [conversation],
  )

  const availableHumans = useMemo(() => {
    if (!humans || !usersFilter || usersFilter.length < 2) {
      setSelectedUserIds([])
      return []
    }

    const filter = usersFilter.toLowerCase()
    const list = humans.filter(
      (user) =>
        !assignedUserIds?.includes(user.id) &&
        (user.username.toLowerCase().includes(filter) ||
          user.email.toLowerCase().includes(filter) ||
          (user.profile?.firstName && user.profile.firstName.toLowerCase().includes(filter)) ||
          (user.profile?.lastName && user.profile.lastName.toLowerCase().includes(filter)) ||
          (user.profile?.business && user.profile.business.toLowerCase().includes(filter)) ||
          (user.profile?.position && user.profile.position.toLowerCase().includes(filter))),
    )
    setSelectedUserIds((prev) => prev.filter((id) => list.some((human) => human.id === id)))
    return list
  }, [humans, assignedUserIds, usersFilter])

  const isOwner = user?.id === conversation?.ownerId

  const { mutate: createNewConversation, isPending: isCreating } = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error('User not set')
      }
      return await createConversation({
        data: {
          userIds: [...selectedUserIds, user.id],
          assistantIds: [...selectedAssistantIds],
          ownerId: user.id,
        },
      })
    },
    onSettled: (result) => {
      if (!user) {
        throw new Error('User not set')
      }

      queryClient.invalidateQueries({ queryKey: [queryKeys.Conversations, user.id] })
      if (result?.createAiConversation) {
        navigate({ to: `/conversations/${result.createAiConversation.id}` })
      }

      dialogRef.current?.close()
    },
  })

  const { mutate: addParticipants, isPending: isAdding } = useMutation({
    mutationFn: async () => {
      if (!conversation) {
        throw new Error('Conversation not set')
      }
      if (!isOwner) {
        throw new Error('Only the owner can add participants')
      }
      if (!user?.id) {
        throw new Error('User not set')
      }
      return await addConversationParticipants({
        data: { conversationId: conversation.id, assistantIds: selectedAssistantIds, userIds: selectedUserIds },
      })
    },
    onSettled: async () => {
      if (!conversation || !user) return

      await queryClient.invalidateQueries({
        queryKey: [queryKeys.Conversation, conversation.id],
      })
      await queryClient.invalidateQueries({
        queryKey: [queryKeys.Conversations, user.id],
      })

      dialogRef.current?.close()
    },
  })

  const handleSubmit = () => {
    if (props.dialogMode === 'new') {
      createNewConversation()
    } else {
      addParticipants()
    }
  }

  const handleOpen = () => {
    dialogRef.current?.showModal()
  }

  useEffect(() => {
    if (props.isOpen) {
      dialogRef.current?.showModal()
    }
  }, [props.isOpen])

  const title = props.dialogMode === 'new' ? t('texts.newConversation') : t('texts.addParticipants')
  const description =
    props.dialogMode === 'new' ? t('texts.newConversationConfirmation') : t('texts.addParticipantsConfirmation')
  const submitButtonText = props.dialogMode === 'new' ? t('actions.create') : t('actions.add')
  const buttonText = props.dialogMode === 'new' ? t('actions.new') : `${t('actions.add')}...`
  const buttonClass = props.dialogMode === 'new' ? 'btn btn-primary btn-sm' : 'btn btn-neutral btn-xs'
  const isPending = isCreating || isAdding

  if (!user) {
    return null
  }

  return (
    <>
      <button type="button" className={`${buttonClass} text-neutral-content`} onClick={handleOpen}>
        {props.dialogMode === 'new' ? null : <PlusIcon />}
        {buttonText}
      </button>

      <LoadingSpinner isLoading={isPending} />
      <DialogForm
        ref={dialogRef}
        title={title}
        description={description}
        onSubmit={handleSubmit}
        disabledSubmit={selectedUserIds.length < 1 && selectedAssistantIds.length < 1}
        submitButtonText={submitButtonText}
        submitButtonTooltipText={t('tooltips.addNoParticipantsSelected')}
      >
        <div className="flex w-full gap-2">
          <div className="w-1/2">
            <h4 className="underline">{t('conversations.assistants')}</h4>
            {availableAssistants.length < 1 ? (
              <p>{t('texts.noAssistantsAvailable')}</p>
            ) : (
              availableAssistants.map((assistant) => (
                <label key={assistant.id} className="label cursor-pointer justify-start gap-2">
                  <input
                    type="checkbox"
                    name="assistants"
                    value={assistant.id}
                    className="checkbox-info checkbox checkbox-sm"
                    checked={selectedAssistantIds.includes(assistant.id)}
                    onChange={(event) => {
                      const value = event.target.checked
                      if (value) {
                        setSelectedAssistantIds((prev) => [...prev, assistant.id])
                      } else {
                        setSelectedAssistantIds((prev) => prev.filter((id) => id !== assistant.id))
                      }
                    }}
                  />
                  <span className="label-text">{assistant.name}</span>
                </label>
              ))
            )}
          </div>
          <div className="w-1/2">
            <h4 className="underline">{t('conversations.humans')}</h4>

            <Input
              onChange={(event) => setUsersFilter(event.currentTarget.value)}
              name={'userFilter'}
              placeholder={t('placeholders.searchUsers')}
            />
            <label className="label cursor-pointer justify-start gap-2">
              <input
                disabled={availableHumans.length < 1}
                type="checkbox"
                name="selectAll"
                className="checkbox-primary checkbox checkbox-sm"
                checked={selectedUserIds.length > 0}
                ref={(element) => {
                  if (!element) return
                  element.indeterminate = selectedUserIds.length > 0 && selectedUserIds.length < availableHumans.length
                }}
                onChange={(event) => {
                  const value = event.target.checked
                  if (value) {
                    setSelectedUserIds(availableHumans.map((human) => human.id))
                  } else {
                    setSelectedUserIds([])
                  }
                }}
              />

              {availableHumans.length < 1 ? (
                <span className="info label-text font-bold">{t('texts.noUsersFound')}</span>
              ) : (
                <span className="info label-text font-bold">{`${availableHumans.length} ${t('texts.usersFound')}`}</span>
              )}
            </label>

            <div className="h-48 overflow-y-scroll">
              {availableHumans.map((human) => (
                <label key={human.id} className="label cursor-pointer justify-start gap-2">
                  <input
                    type="checkbox"
                    name="userIds"
                    value={human.id}
                    className="checkbox-info checkbox checkbox-sm"
                    checked={selectedUserIds.includes(human.id)}
                    onChange={(event) => {
                      const value = event.target.checked
                      if (value) {
                        setSelectedUserIds((prev) => [...prev, human.id])
                      } else {
                        setSelectedUserIds((prev) => prev.filter((id) => id !== human.id))
                      }
                    }}
                  />
                  <span className="label-text">
                    {`${human.username} (${human.email} ${human.profile ? '| ' + human.profile?.business : ''} )`}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </DialogForm>
    </>
  )
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { graphql } from '../../gql'
import {
  ConversationParticipantsDialogButton_AssistantFragment,
  ConversationParticipantsDialogButton_ConversationFragment,
  UserFragment,
} from '../../gql/graphql'
import { useEmailInvitations } from '../../hooks/use-email-invitations'
import { useTranslation } from '../../i18n/use-translation-hook'
import ChatBubbleIcon from '../../icons/chat-bubble-icon'
import { UserPlusIcon } from '../../icons/user-plus-icon'
import { addConversationParticipants } from '../../server-functions/conversation-participations'
import { createConversation } from '../../server-functions/conversations'
import { DialogForm } from '../dialog-form'
import { toastError } from '../georgeToaster'
import { LoadingSpinner } from '../loading-spinner'
import { EmailChipsInput } from './email-chips-input'
import { validateEmails } from './email-validation'
import { getConversationQueryOptions } from './get-conversation'
import { getConversationsQueryOptions } from './get-conversations'
import { UsersSelector } from './users-selector'

graphql(`
  fragment ConversationParticipantsDialogButton_Conversation on AiConversation {
    ...ConversationBase
    participants {
      id
      userId
      assistantId
    }
  }
`)

graphql(`
  fragment ConversationParticipantsDialogButton_Assistant on AiAssistant {
    id
    name
  }
`)

interface ConversationParticipantsDialogButtonProps {
  conversation?: ConversationParticipantsDialogButton_ConversationFragment
  assistants: ConversationParticipantsDialogButton_AssistantFragment[]
  users: UserFragment[]
  isOpen?: boolean
  userId: string
  variant?: 'default' | 'ghost' | 'primary'
}

export const ConversationParticipantsDialogButton = ({
  conversation,
  assistants,
  users,
  isOpen,
  userId,
  variant = 'ghost',
}: ConversationParticipantsDialogButtonProps) => {
  const { t } = useTranslation()
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [selectedAssistantIds, setSelectedAssistantIds] = useState<string[]>([])
  const [emailChips, setEmailChips] = useState<string[]>([])
  const [emailError, setEmailError] = useState<string | null>(null)
  const [allowDifferentEmailAddress, setAllowDifferentEmailAddress] = useState(false)
  const [allowMultipleParticipants, setAllowMultipleParticipants] = useState(false)

  const dialogRef = useRef<HTMLDialogElement>(null)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

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

  const availableUsers = useMemo(
    () => users.filter((user) => !assignedUserIds?.includes(user.id)),
    [users, assignedUserIds],
  )

  const isCreatingNewConversation = !conversation
  const isOwner = isCreatingNewConversation || userId === conversation?.ownerId

  const { mutateAsync: createNewConversation, isPending: isCreating } = useMutation({
    mutationFn: async () => {
      return await createConversation({
        data: {
          userIds: [...selectedUserIds, userId],
          assistantIds: [...selectedAssistantIds],
        },
      })
    },
  })

  const { mutate: addParticipants, isPending: isAdding } = useMutation({
    mutationFn: async () => {
      if (!conversation || !isOwner) {
        toastError(t('errors.notAllowed'))
        return
      }

      return await addConversationParticipants({
        data: {
          conversationId: conversation.id,
          assistantIds: selectedAssistantIds,
          userIds: selectedUserIds,
        },
      })
    },
    onSettled: async () => {
      if (conversation) {
        await queryClient.invalidateQueries(getConversationQueryOptions(conversation.id))
        await queryClient.invalidateQueries(getConversationsQueryOptions())
      }
      setEmailChips([])
      setEmailError(null)
    },
  })

  const handleOpen = () => {
    dialogRef.current?.showModal()
  }

  const handleSubmit = async () => {
    if (!conversation) {
      // Validate at least one participant selected
      if (selectedUserIds.length < 1 && selectedAssistantIds.length < 1 && emailChips.length < 1) {
        toastError(t('tooltips.addNoParticipantsSelected'))
        return
      }

      if (emailChips.length > 0) {
        const { invalidEmails } = validateEmails(emailChips)

        if (invalidEmails.length > 0) {
          setEmailError(t('errors.invalidEmail'))
          return
        }
      }

      dialogRef.current?.close()

      try {
        const conversationResult = await createNewConversation()
        const conversationId = conversationResult?.createAiConversation?.id

        if (!conversationId) {
          toastError(t('invitations.missingConversationId'))
          return
        }

        await queryClient.invalidateQueries(getConversationsQueryOptions())
        navigate({ to: `/conversations/${conversationId}` })

        if (emailChips.length > 0) {
          await sendEmailInvitations(
            conversationId,
            emailChips.join(','),
            allowDifferentEmailAddress,
            allowMultipleParticipants,
          )
        }

        setEmailChips([])
        setEmailError(null)
      } catch (error) {
        toastError(t('conversations.failedToCreateConversation', { error: error.message }))
      }
    } else {
      // Validate at least one participant selected
      if (selectedUserIds.length < 1 && selectedAssistantIds.length < 1 && emailChips.length < 1) {
        toastError(t('tooltips.addNoParticipantsSelected'))
        return
      }

      if (emailChips.length > 0) {
        const { invalidEmails } = validateEmails(emailChips)

        if (invalidEmails.length > 0) {
          setEmailError(t('errors.invalidEmail'))
          return
        }
      }

      dialogRef.current?.close()

      try {
        addParticipants()

        if (emailChips.length > 0) {
          await sendEmailInvitations(
            conversation?.id || '',
            emailChips.join(','),
            allowDifferentEmailAddress,
            allowMultipleParticipants,
          )
        }

        setEmailChips([])
        setEmailError(null)
      } catch (error) {
        toastError(t('conversations.failedToAddParticipants', { error: error.message }))
      }
    }
  }

  const { sendEmailInvitations, isSendingInvitation } = useEmailInvitations(conversation?.id ?? '')

  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.showModal()
    }
  }, [isOpen])

  const title = !conversation ? t('texts.newConversation') : t('texts.addParticipants')
  const description = !conversation
    ? t('texts.newConversationConfirmation')
    : t('conversations.addParticipantsConfirmation')
  const submitButtonText = !conversation ? t('actions.create') : t('actions.add')
  const buttonText = !conversation ? t('texts.newConversation') : `${t('actions.add')}`
  const isPending = isCreating || isAdding || isSendingInvitation

  const buttonClasses = {
    default: 'btn btn-sm',
    ghost: 'btn btn-ghost btn-sm',
    primary: 'btn btn-primary btn-sm',
  }

  return (
    <>
      <LoadingSpinner isLoading={isPending} />
      <button
        type="button"
        className={twMerge(buttonClasses[variant], conversation && 'btn-square')}
        onClick={handleOpen}
      >
        {conversation ? (
          <UserPlusIcon className="size-6" />
        ) : (
          <>
            <ChatBubbleIcon className="size-6" />
            <span>{buttonText}</span>
          </>
        )}
      </button>

      <DialogForm
        ref={dialogRef}
        title={title}
        description={description}
        onSubmit={handleSubmit}
        disabledSubmit={isPending}
        submitButtonText={submitButtonText}
        className="max-w-5xl"
      >
        <div className="grid grid-cols-3 gap-4 *:flex *:max-h-64 *:flex-col *:gap-2 max-md:grid-cols-1">
          {/* Assistants Column */}
          <div>
            <h4 className="text-lg font-semibold underline">{t('conversations.assistants')}</h4>
            {availableAssistants.length < 1 ? (
              <p>{t('texts.noAssistantsAvailable')}</p>
            ) : (
              <div className="flex flex-col gap-2 overflow-y-auto rounded-box border border-transparent p-2 hover:border-base-300">
                {availableAssistants.map((assistant) => (
                  <label key={assistant.id} className="label cursor-pointer items-center justify-start gap-2">
                    <input
                      type="checkbox"
                      name="assistants"
                      value={assistant.id}
                      className="checkbox checkbox-xs checkbox-info"
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
                    <span className="truncate text-sm" title={assistant.name}>
                      {assistant.name}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* User Column */}
          <div className="h-64">
            <h4 className="text-lg font-semibold underline">{t('conversations.humans')}</h4>
            <UsersSelector
              users={availableUsers}
              selectedUserIds={selectedUserIds}
              setSelectedUserIds={setSelectedUserIds}
              className="min-h-0"
            />
          </div>

          {/* Invite Column */}
          {isOwner && (
            <div>
              <h4 className="text-lg font-semibold underline">{t('labels.invitation')}</h4>
              <EmailChipsInput
                emails={emailChips}
                setEmails={setEmailChips}
                placeholder={t('placeholders.emailToInvite')}
              />
              {emailError && <p className="text-sm text-error">{emailError}</p>}
              <div className="flex flex-col gap-1 text-sm">
                <label className="label gap-2 text-wrap">
                  <input
                    type="checkbox"
                    checked={allowDifferentEmailAddress}
                    className="checkbox checkbox-xs checkbox-info"
                    onChange={(event) => setAllowDifferentEmailAddress(event.target.checked)}
                  />
                  <span>{t('texts.allowDifferentEmail')}</span>
                </label>
                <label className="label gap-2 text-wrap">
                  <input
                    type="checkbox"
                    checked={allowMultipleParticipants}
                    className="checkbox checkbox-xs checkbox-info"
                    onChange={(event) => setAllowMultipleParticipants(event.target.checked)}
                  />
                  <span>{t('texts.allowMultipleParticipants')}</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </DialogForm>
    </>
  )
}

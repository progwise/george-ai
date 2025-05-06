import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'

import { FragmentType, graphql, useFragment } from '../../gql'
import { useEmailInvitations } from '../../hooks/use-email-invitations'
import { useTranslation } from '../../i18n/use-translation-hook'
import { PlusIcon } from '../../icons/plus-icon'
import { queryKeys } from '../../query-keys'
import { createConversation } from '../../server-functions/conversations'
import { addConversationParticipants } from '../../server-functions/participations'
import { DialogForm } from '../dialog-form'
import { Input } from '../form/input'
import { toastError } from '../georgeToaster'
import { LoadingSpinner } from '../loading-spinner'
import { EmailChipsInput } from './email-chips-input'
import { validateEmails } from './email-validation'

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
  userId: string
}

export const ParticipantsDialog = (props: ParticipantsDialogProps) => {
  const { t } = useTranslation()
  const [usersFilter, setUsersFilter] = useState<string | null>(null)
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [selectedAssistantIds, setSelectedAssistantIds] = useState<string[]>([])
  const [emailChips, setEmailChips] = useState<string[]>([])
  const [emailError, setEmailError] = useState<string | null>(null)
  const [allowDifferentEmailAddress, setAllowDifferentEmailAddress] = useState(false)
  const [allowMultipleParticipants, setAllowMultipleParticipants] = useState(false)

  const dialogRef = useRef<HTMLDialogElement>(null)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

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

  const isCreatingNewConversation = props.dialogMode === 'new'
  const isOwner = isCreatingNewConversation || props.userId === conversation?.ownerId

  const { mutateAsync: createNewConversation, isPending: isCreating } = useMutation({
    mutationFn: async () => {
      return await createConversation({
        data: {
          userIds: [...selectedUserIds, props.userId],
          assistantIds: [...selectedAssistantIds],
          ownerId: props.userId,
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
        await queryClient.invalidateQueries({ queryKey: [queryKeys.Conversation, conversation.id] })
        await queryClient.invalidateQueries({ queryKey: [queryKeys.Conversations, props.userId] })
      }
      setEmailChips([])
      setEmailError(null)
    },
  })

  const handleOpen = () => {
    dialogRef.current?.showModal()
  }

  const handleSubmit = async () => {
    if (props.dialogMode === 'new') {
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

        await queryClient.invalidateQueries({ queryKey: [queryKeys.Conversations, props.userId] })
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

  const { sendEmailInvitations, isSendingInvitation } = useEmailInvitations(conversation?.id ?? '', props.userId)

  useEffect(() => {
    if (props.isOpen && dialogRef.current) {
      dialogRef.current.showModal()
    }
  }, [props.isOpen])

  const title = props.dialogMode === 'new' ? t('texts.newConversation') : t('texts.addParticipants')
  const description =
    props.dialogMode === 'new' ? t('texts.newConversationConfirmation') : t('texts.addParticipantsConfirmation')
  const submitButtonText = props.dialogMode === 'new' ? t('actions.create') : t('actions.add')
  const buttonText = props.dialogMode === 'new' ? t('actions.new') : `${t('actions.add')}...`
  const buttonClass = props.dialogMode === 'new' ? 'btn-primary mx-1' : 'btn-neutral lg:btn-xs'
  const isPending = isCreating || isAdding || isSendingInvitation

  return (
    <>
      <LoadingSpinner isLoading={isPending} />
      <button type="button" className={`${buttonClass} btn btn-sm`} onClick={handleOpen}>
        {props.dialogMode === 'add' && <PlusIcon />}
        {buttonText}
      </button>

      <DialogForm
        ref={dialogRef}
        title={title}
        description={description}
        onSubmit={handleSubmit}
        disabledSubmit={selectedUserIds.length < 1 && selectedAssistantIds.length < 1 && emailChips.length < 1}
        submitButtonText={submitButtonText}
        submitButtonTooltipText={t('tooltips.addNoParticipantsSelected')}
        className="w-full max-w-[800px] px-4 sm:px-6 md:px-8"
      >
        <div className="flex w-full flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <h4 className="mb-2 text-lg font-semibold underline">{t('conversations.assistants')}</h4>
            {availableAssistants.length < 1 ? (
              <p>{t('texts.noAssistantsAvailable')}</p>
            ) : (
              availableAssistants.map((assistant) => (
                <label key={assistant.id} className="label cursor-pointer items-center justify-start gap-2">
                  <input
                    type="checkbox"
                    name="assistants"
                    value={assistant.id}
                    className="checkbox checkbox-info checkbox-xs"
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

          <div className="flex-1">
            <h4 className="text-lg font-semibold underline">{t('conversations.humans')}</h4>
            <input
              type="text"
              className="input input-bordered input-md w-full"
              onChange={(event) => setUsersFilter(event.currentTarget.value)}
              name={'userFilter'}
              placeholder={t('placeholders.searchUsers')}
            />
            <label className="label cursor-pointer items-center justify-start gap-2">
              <input
                disabled={availableHumans.length < 1}
                type="checkbox"
                name="selectAll"
                className="checkbox checkbox-info checkbox-xs"
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
            <div className="max-h-48 flex-grow overflow-y-auto">
              {availableHumans.map((human) => (
                <label key={human.id} className="label cursor-pointer items-center justify-start gap-2">
                  <input
                    type="checkbox"
                    name="userIds"
                    value={human.id}
                    className="checkbox checkbox-info checkbox-xs"
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
                  <span className="label-text text-sm leading-tight">
                    {`${human.username} (${human.email} ${human.profile && human.profile.business !== null ? '| ' + human.profile?.business : ''} )`}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {isOwner && (
            <div className="flex-1">
              <h4 className="mb-2 text-lg font-semibold underline">{t('labels.invitation')}</h4>
              <EmailChipsInput
                emails={emailChips}
                setEmails={setEmailChips}
                placeholder={t('placeholders.emailToInvite')}
              />
              {emailError && <p className="text-error text-sm">{emailError}</p>}
              <div className="mt-2 flex flex-col gap-1">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={allowDifferentEmailAddress}
                    className="checkbox-info checkbox checkbox-xs"
                    onChange={(event) => setAllowDifferentEmailAddress(event.target.checked)}
                  />
                  <span className="text-sm">{t('texts.allowDifferentEmail')}</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={allowMultipleParticipants}
                    className="checkbox-info checkbox checkbox-xs"
                    onChange={(event) => setAllowMultipleParticipants(event.target.checked)}
                  />
                  <span className="text-sm">{t('texts.allowMultipleParticipants')}</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </DialogForm>
    </>
  )
}

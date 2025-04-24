import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'

import { FragmentType, graphql, useFragment } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { ClipboardIcon } from '../../icons/clipboard-icon'
import { EmailIcon } from '../../icons/email-icon'
import { PlusIcon } from '../../icons/plus-icon'
import { queryKeys } from '../../query-keys'
import { createConversation } from '../../server-functions/conversations'
import { createConversationInvitation } from '../../server-functions/participations'
import { addConversationParticipants } from '../../server-functions/participations'
import { DialogForm } from '../dialog-form'
import { useClipboard } from '../form/clipboard'
import { validateEmails } from '../form/email-validation'
import { Input } from '../form/input'
import { toastError } from '../georgeToaster'
import { LoadingSpinner } from '../loading-spinner'
import { sendEmailInvitations } from './email-invitation'

const ParticipantsDialog_ConversationFragment = graphql(`
  fragment ParticipantsDialog_Conversation on AiConversation {
    id
    ownerId
    participants {
      id
      userId
      assistantId
    }
    conversationInvitation {
      link
      allowDifferentEmailAddress
      allowMultipleParticipants
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
  userId?: string
}

export const ParticipantsDialog = (props: ParticipantsDialogProps) => {
  const { t } = useTranslation()
  const [usersFilter, setUsersFilter] = useState<string | null>(null)
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [selectedAssistantIds, setSelectedAssistantIds] = useState<string[]>([])
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [allowDifferentEmailAddress, setAllowDifferentEmailAddress] = useState(false)
  const [allowMultipleParticipants, setAllowMultipleParticipants] = useState(false)
  const [isSendingInvitation, setIsSendingInvitation] = useState(false)

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

  const { copyToClipboard } = useClipboard()

  const { mutateAsync: createInvitation } = useMutation({
    mutationFn: async ({
      email,
      allowDifferentEmailAddress,
      allowMultipleParticipants,
      language,
      conversationId,
    }: {
      email: string
      allowDifferentEmailAddress: boolean
      allowMultipleParticipants: boolean
      language: string
      conversationId: string
    }) => {
      if (!email || email.trim() === '') {
        toastError(t('errors.emailRequired'))
        return
      }

      return await createConversationInvitation({
        data: {
          conversationId,
          inviterId: props.userId ?? '',
          data: {
            email: email.trim().toLowerCase(),
            allowDifferentEmailAddress,
            allowMultipleParticipants,
            language,
          },
        },
      })
    },
    onError: (error) => {
      toastError(t('invitations.failedToSendInvitation', { error: error.message }))
    },
  })

  const { mutateAsync: createNewConversation, isPending: isCreating } = useMutation({
    mutationFn: async () => {
      if (!props.userId) {
        toastError(t('errors.userNotSet'))
        return
      }

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
      if (!conversation || !props.userId || !isOwner) {
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
      if (conversation && props.userId) {
        await queryClient.invalidateQueries({ queryKey: [queryKeys.Conversation, conversation.id] })
        await queryClient.invalidateQueries({ queryKey: [queryKeys.Conversations, props.userId] })
      }
      setEmail('')
      setEmailError(null)
    },
  })

  const handleOpen = () => {
    dialogRef.current?.showModal()
  }

  const handleSubmit = async () => {
    if (props.dialogMode === 'new') {
      if (email.trim()) {
        const { invalidEmails } = validateEmails(email)

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

        if (email.trim()) {
          await sendEmailInvitations({
            email,
            conversationId,
            allowDifferentEmailAddress,
            allowMultipleParticipants,
            setEmailError,
            setIsSendingInvitation,
            t,
            queryClient,
            createInvitation,
          })
        }

        setEmail('')
        setEmailError(null)
      } catch (error) {
        toastError(t('conversations.failedToCreateConversation', { error: error.message }))
      }
    } else {
      if (email.trim()) {
        const { invalidEmails } = validateEmails(email)

        if (invalidEmails.length > 0) {
          setEmailError(t('errors.invalidEmail'))
          return
        }
      }

      dialogRef.current?.close()

      try {
        addParticipants()

        if (email.trim()) {
          await sendEmailInvitations({
            email,
            conversationId: conversation!.id,
            allowDifferentEmailAddress,
            allowMultipleParticipants,
            setEmailError,
            setIsSendingInvitation,
            t,
            queryClient,
            createInvitation,
          })
        }

        setEmail('')
        setEmailError(null)
      } catch (error) {
        toastError(t('conversations.failedToAddParticipants', { error: error.message }))
      }
    }
  }

  const handleSendInvitation = async () => {
    if (!conversation?.id) {
      toastError(t('invitations.cannotSendInvitation'))
      return
    }

    if (!email.trim()) {
      setEmailError(t('errors.emailRequired'))
      return
    }

    const { invalidEmails } = validateEmails(email)
    if (invalidEmails.length > 0) {
      setEmailError(t('errors.invalidEmail'))
      return
    }

    dialogRef.current?.close()

    setIsSendingInvitation(true)
    try {
      await sendEmailInvitations({
        email,
        conversationId: conversation.id,
        allowDifferentEmailAddress,
        allowMultipleParticipants,
        setEmailError,
        setIsSendingInvitation,
        t,
        queryClient,
        createInvitation,
      })
      setEmail('')
      setEmailError(null)
    } catch (error) {
      toastError(t('invitations.failedToSendInvitation', { error: error.message }))
    } finally {
      setIsSendingInvitation(false)
    }
  }

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

  if (!props.userId) {
    return null
  }

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
        disabledSubmit={selectedUserIds.length < 1 && selectedAssistantIds.length < 1}
        submitButtonText={submitButtonText}
        submitButtonTooltipText={t('tooltips.addNoParticipantsSelected')}
        className="w-[90vw] max-w-[800px]"
      >
        <div className="flex w-full gap-4">
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

          <div className="flex-1">
            <h4 className="mb-2 text-lg font-semibold underline">{t('conversations.humans')}</h4>
            <Input
              onChange={(event) => setUsersFilter(event.currentTarget.value)}
              name={'userFilter'}
              placeholder={t('placeholders.searchUsers')}
            />
            <label className="label cursor-pointer items-center justify-start gap-2">
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
                <label key={human.id} className="label cursor-pointer items-center justify-start gap-2">
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

          {isOwner && (
            <div className="flex-1">
              <h4 className="mb-2 text-lg font-semibold underline">{t('labels.invitation')}</h4>
              <Input
                name="email"
                type="text"
                placeholder={t('placeholders.emailToInvite')}
                value={email}
                onChange={(event) => {
                  const value = event.target.value
                  setEmail(value)
                  setEmailError(null)
                }}
                autoFocus
              />
              {emailError && <p className="text-sm text-error">{emailError}</p>}
              <div className="mt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={allowDifferentEmailAddress}
                    onChange={(event) => setAllowDifferentEmailAddress(event.target.checked)}
                  />
                  <span>{t('labels.allowDifferentEmail')}</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={allowMultipleParticipants}
                    onChange={(event) => setAllowMultipleParticipants(event.target.checked)}
                  />
                  <span>{t('labels.allowMultipleParticipants')}</span>
                </label>
              </div>
              <div className="mt-4 flex items-center justify-end">
                {conversation?.conversationInvitation?.link &&
                  conversation.conversationInvitation.allowDifferentEmailAddress &&
                  conversation.conversationInvitation.allowMultipleParticipants && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-neutral btn-sm tooltip"
                      data-tip={t('tooltips.copyInvitationLink')}
                      onClick={() =>
                        conversation.conversationInvitation?.link &&
                        copyToClipboard(conversation.conversationInvitation.link)
                      }
                    >
                      <ClipboardIcon className="size-5" />
                    </button>
                  )}
                <button
                  type="button"
                  className="btn btn-ghost btn-neutral btn-sm tooltip tooltip-left"
                  data-tip={t('tooltips.sendInvitation')}
                  onClick={handleSendInvitation}
                  disabled={isSendingInvitation}
                >
                  <EmailIcon className="size-6" />
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogForm>
    </>
  )
}

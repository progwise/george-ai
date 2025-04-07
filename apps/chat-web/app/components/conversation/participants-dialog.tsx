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
  const [hasChecked, setHasChecked] = useState(true)
  const [usersFilter, setUsersFilter] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const authContext = useAuth()
  const user = authContext.user

  const conversation = useFragment(ParticipantsDialog_ConversationFragment, props.conversation)
  const assistants = useFragment(ParticipantsDialog_AssistantFragment, props.assistants)
  const humans = useFragment(ParticipantsDialog_HumanFragment, props.humans)

  const existingParticipantIds = conversation?.participants.map(
    (participant) => participant.userId || participant.assistantId,
  )

  const availableAssistants = useMemo(
    () =>
      props.dialogMode === 'new'
        ? assistants || []
        : assistants?.filter((assistant) => !existingParticipantIds?.includes(assistant.id)) || [],
    [props.dialogMode, assistants, existingParticipantIds],
  )

  const availableHumans = useMemo(() => {
    const list =
      props.dialogMode === 'new'
        ? humans || []
        : humans?.filter((user) => !existingParticipantIds?.includes(user.id)) || []

    return list.filter((human) => {
      if (!usersFilter || usersFilter.length < 2) return false
      const filter = usersFilter.toLowerCase()
      return (
        human.username.toLowerCase().includes(filter) ||
        human.email.toLowerCase().includes(filter) ||
        (human.profile?.firstName && human.profile.firstName.toLowerCase().includes(filter)) ||
        (human.profile?.lastName && human.profile.lastName.toLowerCase().includes(filter)) ||
        (human.profile?.business && human.profile.business.toLowerCase().includes(filter)) ||
        (human.profile?.position && human.profile.position.toLowerCase().includes(filter))
      )
    })
  }, [props.dialogMode, humans, existingParticipantIds, usersFilter])

  const isOwner = user?.id === conversation?.ownerId

  const { mutate: createNewConversation, isPending: isCreating } = useMutation({
    mutationFn: async ({ assistantIds, userIds }: { assistantIds: string[]; userIds: string[] }) => {
      if (!user?.id) {
        throw new Error('User not set')
      }
      return await createConversation({
        data: {
          userIds: [...userIds, user.id],
          assistantIds: [...assistantIds],
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
    mutationFn: async ({ assistantIds, userIds }: { assistantIds: string[]; userIds: string[] }) => {
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
        data: { conversationId: conversation.id, assistantIds, userIds },
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

  useEffect(() => {
    if (availableAssistants.length === 0 && availableHumans.length === 0) {
      // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect
      setHasChecked(props.dialogMode === 'new')
    }
  }, [availableAssistants.length, availableHumans.length, props.dialogMode])

  const handleSubmit = (formData: FormData) => {
    const assistantIds = Array.from(formData.getAll('assistantIds')) as string[]
    const userIds = Array.from(formData.getAll('userIds')) as string[]

    if (props.dialogMode !== 'new' && assistantIds.length === 0 && userIds.length === 0) return

    if (props.dialogMode === 'new') {
      createNewConversation({ assistantIds, userIds })
    } else {
      addParticipants({ assistantIds, userIds })
    }
  }

  const handleCheckboxChange = () => {
    const checkboxes = dialogRef.current?.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
    const hasAnyChecked = checkboxes ? Array.from(checkboxes).some((checkbox) => checkbox.checked) : false
    setHasChecked(hasAnyChecked)
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
      <button type="button" className={buttonClass} onClick={handleOpen}>
        {props.dialogMode === 'new' ? null : <PlusIcon />}
        {buttonText}
      </button>

      <LoadingSpinner isLoading={isPending} />
      <DialogForm
        ref={dialogRef}
        title={title}
        description={description}
        onSubmit={handleSubmit}
        disabledSubmit={!hasChecked}
        submitButtonText={submitButtonText}
        submitButtonTooltipText={t('tooltips.addNoParticipantsSelected')}
      >
        <div className="flex w-full gap-2">
          <div className="w-1/2">
            <h4 className="underline">{t('conversations.assistants')}</h4>
            {availableAssistants.length < 1 ? (
              <p>t('texts.noAssistantsAvailable')</p>
            ) : (
              availableAssistants.map((assistant) => (
                <label key={assistant.id} className="label cursor-pointer justify-start gap-2">
                  <input
                    type="checkbox"
                    name="assistants"
                    value={assistant.id}
                    className="checkbos-sm checkbox-info checkbox"
                    defaultChecked={false}
                    onChange={handleCheckboxChange}
                  />
                  <span className="label-text">{assistant.name}</span>
                </label>
              ))
            )}
          </div>
          <div className="w-1/2">
            <h4 className="underline">{t('conversations.humans')}</h4>

            <Input
              className="pb-2"
              onChange={(event) => setUsersFilter(event.currentTarget.value)}
              name={'userFilter'}
              placeholder={t('placeholders.searchUsers')}
            />
            <div className="h-48 overflow-y-scroll">
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  className="checkbox-info checkbox checkbox-sm"
                  defaultChecked={false}
                  onChange={(event) => {
                    const value = event.target.checked
                    const checkboxes = dialogRef.current?.querySelectorAll<HTMLInputElement>(
                      'input[type="checkbox"][name="userIds"]',
                    )
                    checkboxes?.forEach((checkbox) => {
                      checkbox.checked = value
                    })
                  }}
                />
                <span className="info label-text">{`${availableHumans.length} ${t('texts.usersFound')}`}</span>
              </label>
              {availableHumans.map((human) => (
                <label key={human.id} className="label cursor-pointer justify-start gap-2">
                  <input
                    type="checkbox"
                    name="userIds"
                    value={human.id}
                    className="checkbox-info checkbox checkbox-sm"
                    defaultChecked={false}
                    onChange={handleCheckboxChange}
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

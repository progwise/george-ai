import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useMemo, useRef, useState } from 'react'

import { AssistantBaseFragment, UserFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { AssistantList } from '../../routes/_authenticated/conversations/$conversationId.settings/-components/assistant-list'
import { UserList } from '../../routes/_authenticated/conversations/$conversationId.settings/-components/user-list'
import { createConversationInvitation } from '../../server-functions/conversation-participations'
import { createConversation, getConversationsQueryOptions } from '../../server-functions/conversations'
import { DialogForm } from '../dialog-form'

interface NewConversationDialogProps {
  allAssistants: AssistantBaseFragment[]
  allUsers: UserFragment[]
  open: boolean
  onClose: () => void
  userId: string
}

export const NewConversationDialog = ({
  allAssistants,
  allUsers,
  open,
  onClose,
  userId,
}: NewConversationDialogProps) => {
  const { t } = useTranslation()
  const [selectedAssistantIds, setSelectedAssistantIds] = useState<string[]>([])
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [invitedEmails, setInvitedEmails] = useState<string[]>([])

  const userListRef = useRef<{
    getEmailSettings: () => { allowDifferentEmail: boolean; allowMultipleParticipants: boolean }
  }>(null)

  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const { createAiConversation } = await createConversation({
        data: {
          userIds: [...selectedUserIds, userId],
          assistantIds: selectedAssistantIds,
        },
      })

      if (!createAiConversation) {
        throw new Error('failed to create conversation')
      }

      const conversationId = createAiConversation.id

      const { allowDifferentEmail, allowMultipleParticipants } = userListRef.current?.getEmailSettings() ?? {
        allowDifferentEmail: true,
        allowMultipleParticipants: true,
      }

      await createConversationInvitation({
        data: {
          conversationId,
          data: {
            email: invitedEmails.join(','),
            allowDifferentEmailAddress: allowDifferentEmail,
            allowMultipleParticipants,
          },
        },
      })

      return conversationId
    },
    onSuccess: async (conversationId) => {
      onClose()
      await navigate({
        to: '/conversations/$conversationId',
        params: { conversationId },
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries(getConversationsQueryOptions())
      setSelectedAssistantIds([])
      setSelectedUserIds([])
      setInvitedEmails([])
    },
  })

  const selectedAssistants = useMemo(
    () => allAssistants.filter((assistant) => selectedAssistantIds.includes(assistant.id)),
    [allAssistants, selectedAssistantIds],
  )
  const availableAssistants = useMemo(
    () => allAssistants.filter((assistant) => !selectedAssistantIds.includes(assistant.id)),
    [allAssistants, selectedAssistantIds],
  )

  const selectedUsers = useMemo(
    () => allUsers.filter((user) => selectedUserIds.includes(user.id)),
    [allUsers, selectedUserIds],
  )
  const availableUsers = useMemo(
    () => allUsers.filter((user) => !selectedUserIds.includes(user.id)),
    [allUsers, selectedUserIds],
  )

  return (
    <DialogForm
      onSubmit={() => mutate()}
      title={t('texts.newConversation')}
      description={t('texts.newConversationConfirmation')}
      submitButtonText={t('actions.create')}
      open={open}
      onClose={onClose}
      disabledSubmit={isPending}
      className="max-w-5xl"
    >
      <div className="lg:bg-base-200 lg:border-base-300 lg:rounded-box grid gap-4 lg:grid-cols-2 lg:border lg:p-4">
        <div className="flex flex-col">
          <h4 className="font-semibold">{t('conversations.assistants')}</h4>
          <AssistantList
            assistants={selectedAssistants}
            availableAssistants={availableAssistants}
            disabled={isPending}
            onAssign={(assistantId) => setSelectedAssistantIds((prev) => [...prev, assistantId])}
            onUnassign={(assistantId) => setSelectedAssistantIds((prev) => prev.filter((id) => id !== assistantId))}
          />
        </div>

        <div className="flex flex-col">
          <h4 className="font-semibold">{t('conversations.humans')}</h4>
          <UserList
            userId={userId}
            users={selectedUsers}
            availableUsers={availableUsers}
            emailInvites={invitedEmails}
            pendingEmailInvites={[]}
            disabled={isPending}
            onAssign={(userId) => setSelectedUserIds((prev) => [...prev, userId])}
            onUnassign={(userId) => setSelectedUserIds((prev) => prev.filter((id) => id !== userId))}
            onInvite={({ email }) => setInvitedEmails((prev) => [...prev, email])}
            ref={userListRef}
          />
        </div>
      </div>
    </DialogForm>
  )
}
